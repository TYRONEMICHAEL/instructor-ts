import { Message } from "@instructor-ts/instructor";
export interface Config {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export type CompletionsRequest<T extends string> = {
  model: string;
  messages: Message<T>[];
};
