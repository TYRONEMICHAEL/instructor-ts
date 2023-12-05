import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { defaultMetadataStorage } from "class-transformer/cjs/storage";
import { validate as validateResponseModel } from "class-validator";
import {
  ApiResponse,
  BaseMessage,
  Constructor,
  CreateRequest,
  DecoratedRequest,
  Role,
  SharedContext,
  UnableToParseResponse,
  UserRequest,
  ValidationError,
} from "./types";
import {
  omit,
  identity as passThrough,
  withContextUpdates as withContext,
} from "./utils";
import OpenAI from "openai";
import { completions } from "./api";
import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/chat/completions";

/******************************************************
 * Decoorate the request
 * Add a tool to the request for data extraction
 ******************************************************/

const decorate = async <ResponseModel, Request>(
  request: UserRequest<ResponseModel, Request>,
): Promise<DecoratedRequest<Request>> => {
  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: defaultMetadataStorage,
  });
  const name = request.ResponseModel.name;
  const schema = schemas[name];
  // Add definitions for any refrences in the schema
  const updatedSchema = Object.keys(schemas).reduce((acc, key) => {
    if (key !== name) {
      acc["definitions"] = {
        ...acc["definitions"],
        [key]: schemas[key],
      };
    }
    return acc;
  }, schema);

  const transformedRequest = {
    ...omit(request, "ResponseModel", "maxRetries"),
    tools: [
      {
        type: "function",
        function: {
          name: `${name}`,
          description: `Correctly classify ${name} with all the required parameters and the correct types`,
          parameters: updatedSchema as Record<string, unknown>,
        },
      },
    ],
    tool_choice: "auto",
  };
  return transformedRequest;
};

const addMessages =
  (messages: BaseMessage[]) =>
  async <Request>(
    request: DecoratedRequest<Request>,
  ): Promise<DecoratedRequest<Request>> => {
    const transformedRequest = {
      ...request,
      messages: [...request.messages, ...messages],
    };
    console.log("transformedRequest", transformedRequest);
    return transformedRequest;
  };

/******************************************************
 * Parsing
 * Parse the response into a response model
 ******************************************************/

const parse =
  <ResponseModel, Response>(ResponseModel: Constructor<ResponseModel>) =>
  async (apiResponse: ApiResponse<Response>): Promise<ResponseModel> => {
    const [args] = apiResponse;
    if (!args) {
      throw new UnableToParseResponse();
    }
    const responseModel = Object.assign(new ResponseModel(), JSON.parse(args));
    return responseModel;
  };

/******************************************************
 * Validation
 * Validate the response model
 ******************************************************/

const validate = async <ResponseModel extends object>(
  responseModel: ResponseModel,
) => {
  const errors = await validateResponseModel(responseModel);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return responseModel;
};

/******************************************************
 * Error handling
 * Handle any errors including api and validation errors
 * and retry the request if necessary
 ******************************************************/

function handleValidationError<Request, ResponseModel extends object, Response>(
  e: ValidationError,
  context: SharedContext<Request, ResponseModel, Response>,
  create: CreateRequest<Request, Response>,
) {
  const { maxRetries, retries } = context;
  if (retries < maxRetries) {
    const messages = e.validationErrors.map((error) => ({
      role: Role.USER,
      content: error.toString(false, false, null, true),
    }));

    return execute(
      messages,
      create,
    )({
      ...context,
      retries: retries + 1,
    });
  }
}

const handleErrorWithRetry =
  <Request, ResponseModel extends object, Response>(
    create: CreateRequest<Request, Response>,
  ) =>
  (e: Error, context: SharedContext<Request, ResponseModel, Response>) => {
    if (e instanceof ValidationError) {
      return handleValidationError(e, context, create);
    }

    throw { error: e, context };
  };

/******************************************************
 * Context
 * Update the context from previous steps
 ******************************************************/

const addResponseToContext = <Request, ResponseModel, Response>(
  sharedContext: SharedContext<Request, ResponseModel, Response>,
  apiResponse: ApiResponse<Response>,
): SharedContext<Request, ResponseModel, Response> => {
  const [, response] = apiResponse;
  return {
    ...sharedContext,
    apiResponses: [...sharedContext.apiResponses, response],
  };
};

/******************************************************
 * Pipeline execution
 * Execute the pipeline including all the steps above
 ******************************************************/

export const execute =
  <Request, ResponseModel extends object, Response>(
    messages: BaseMessage[],
    apiRequest: CreateRequest<Request, Response>,
  ) =>
  (context: SharedContext<Request, ResponseModel, Response>) => {
    const { originalRequest, ResponseModel } = context;
    const handleError = handleErrorWithRetry(apiRequest);
    const decoratedRequestWithContext = withContext(
      decorate,
      passThrough,
    )([context, originalRequest]);

    return decoratedRequestWithContext
      .then(withContext(addMessages(messages), passThrough))
      .then(withContext(apiRequest, addResponseToContext))
      .then(withContext(parse(ResponseModel), passThrough))
      .then(withContext(validate, passThrough))
      .then(([context, responseModel]) => [responseModel, context.apiResponses])
      .catch(([error, context]) => handleError(error, context));
  };

/******************************************************
 * Entry point
 * Create the context and execute the pipeline
 ******************************************************/

const instructor = (openai: OpenAI) => {
  return {
    completions: {
      create: <ResponseModel extends object>(
        request: UserRequest<
          ResponseModel,
          OpenAI.ChatCompletionCreateParamsNonStreaming
        >,
      ) => {
        const { create } = completions(openai);
        const { maxRetries, ResponseModel } = request;
        const sharedContext = {
          maxRetries: maxRetries || 0,
          retries: 0,
          ResponseModel,
          originalRequest: request,
          apiResponses: [],
        };

        return execute<
          ChatCompletionCreateParamsNonStreaming,
          ResponseModel,
          ChatCompletion
        >(
          [],
          create,
        )(sharedContext);
      },
    },
  };
};

export default instructor;
