import {
  Capability,
  Constructor,
  SupportedCapabilities,
} from "@instructor-ts/instructor";

import { CompletionsRequest } from "./types";
import OpenAI from "openai";

class CompletionsApi<M, T extends string>
  implements Capability<CompletionsRequest<T>, M>
{
  name = SupportedCapabilities.Completions;

  create(openai: OpenAI) {
    return async (
      request: CompletionsRequest<T> & { responseModel: Constructor<M> },
    ) => {
      const { messages, model } = request;
      const responseData = await openai.chat.completions.create({
        ...request,
        model,
        messages,
      });

      const instance = new request.responseModel();
      const obj = JSON.parse(
        responseData.choices[0].message.tool_calls[0].function.arguments,
      );
      return Object.assign(instance, obj);
    };
  }
}

export default CompletionsApi;
