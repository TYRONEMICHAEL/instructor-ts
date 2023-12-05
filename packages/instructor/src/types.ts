/******************************************************
 * Imports
 * Required modules and external types
 ******************************************************/
import { ValidationError as ClassValidatorValidationError } from "class-validator";
import OpenAI from "openai";

/******************************************************
 * Basic Types
 * Fundamental types used throughout the application
 ******************************************************/
export type Constructor<T> = new (...args: unknown[]) => T;

/******************************************************
 * User Requests
 * Types defining user requests and their structure
 ******************************************************/
export type UserRequest<ResponseModel, Request> = {
  ResponseModel: Constructor<ResponseModel>;
  maxRetries?: number;
  messages: unknown[];
} & Request;

export type UserChatCompletionRequest<ResponseModel> = UserRequest<
  ResponseModel,
  OpenAI.ChatCompletionCreateParamsNonStreaming
>;

/******************************************************
 * Decorators
 * Types related to request decoration
 ******************************************************/
export type DecoratedRequest<Request> = Omit<
  Request,
  "ResponseModel" | "maxRetries"
> & {
  messages: unknown[];
};

/******************************************************
 * API Response
 * Structure of the response from the API
 ******************************************************/
export type ApiResponse<Response> = [string | undefined, Response];

/******************************************************
 * Shared Context
 * Shared data structure for request handling
 ******************************************************/
export type SharedContext<Request, ResponseModel, Response> = {
  maxRetries: number;
  retries: number;
  ResponseModel: Constructor<ResponseModel>;
  originalRequest: UserRequest<ResponseModel, Request>;
  apiResponses: Response[];
};

/******************************************************
 * User Response
 * Structure of the response sent back to the user
 ******************************************************/
export type UserResponse<ResponseModel, Response> = [Response[], ResponseModel];

/******************************************************
 * Request and Response Handlers
 * Functions for handling and transforming requests and responses
 ******************************************************/
export type DecorateRequest<Request> = (
  request: Request,
) => Promise<DecoratedRequest<Request>>;

export type AddResponseToContext<Request, ResponseModel, Response> = (
  sharedContext: SharedContext<Request, ResponseModel, Response>,
) => (
  response: Response,
) => Promise<SharedContext<Request, ResponseModel, Response>>;

export type CreateRequest<Request, Response> = (
  request: DecoratedRequest<Request>,
) => Promise<ApiResponse<Response>>;

export type AddValidationCorrections<Request> = (
  request: DecoratedRequest<Request>,
) => Promise<DecoratedRequest<Request>>;

export type ParseResponse<Request, ResponseModel, Response> = (
  sharedContext: SharedContext<Request, ResponseModel, Response>,
) => (response: ApiResponse<Response>) => Promise<ResponseModel>;

export type ValidateResponse<ResponseModel> = (
  response: ResponseModel,
) => Promise<ResponseModel>;

/******************************************************
 * Error Handling
 * Types and classes for error management
 ******************************************************/
export enum ErrorType {
  ValidationError = "ValidationError",
  UnableToParseResponse = "UnableToParseResponse",
  InvalidResponse = "InvalidResponse",
}

export class InternalError extends Error {
  constructor(readonly type: ErrorType) {
    super(type);
    this.name = type;
  }
}

export class UnableToParseResponse extends InternalError {
  constructor() {
    super(ErrorType.UnableToParseResponse);
    this.name = ErrorType.UnableToParseResponse;
  }
}

export class ValidationError extends InternalError {
  constructor(readonly validationErrors: ClassValidatorValidationError[]) {
    super(ErrorType.ValidationError);
    this.name = ErrorType.ValidationError;
  }
}

export type ValidationErrors = ClassValidatorValidationError[];

export class InstructorError<Request, ResponseModel, Response> extends Error {
  constructor(
    error: InternalError,
    readonly context: SharedContext<Request, ResponseModel, Response>,
  ) {
    super(error.type);
    this.name = error.type;
  }
}

/******************************************************
 * Message Structures
 * Types defining the structure of various messages
 ******************************************************/
export enum Role {
  USER = "user",
  SYSTEM = "system",
  ASSISTANT = "assistant",
  FUNCTION = "function",
}

export interface BaseMessage {
  role: Role;
  content: string;
}

export interface UserMessage extends BaseMessage {
  role: Role.USER;
}
export interface SystemMessage extends BaseMessage {
  role: Role.SYSTEM;
}
export interface AssistantMessage extends BaseMessage {
  role: Role.ASSISTANT;
}
export interface FunctionMessage extends BaseMessage {
  role: Role.FUNCTION;
  name: string;
}

export type Message =
  | UserMessage
  | SystemMessage
  | AssistantMessage
  | FunctionMessage;
