import OpenAI from "openai";
import { ApiResponse } from "../../types";

/******************************************************
 * Api: Chat Completion
 * OpenAi Docs: https://beta.openai.com/docs/api-reference/completions/create
 ******************************************************/

const completions = (openai: OpenAI) => ({
  create: async (
    request: OpenAI.ChatCompletionCreateParamsNonStreaming,
  ): Promise<ApiResponse<OpenAI.ChatCompletion>> => {
    const res = await openai.chat.completions.create(request);
    const args = res.choices?.[0].message?.tool_calls?.[0].function?.arguments;
    return [args, res];
  },
});

export default completions;
