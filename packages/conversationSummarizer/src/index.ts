import instructor, { Role } from "@instructor-ts/instructor";
import { IsString, IsEnum, Length } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import OpenAI from "openai";
import "dotenv/config";
import { conversation } from "./conversation";

class SummarizedConversation {
  @IsEnum(Role)
  @JSONSchema({
    description: "The person who summarized the conversation",
    examples: [Role.ASSISTANT],
  })
  role: Role;

  @IsString()
  @Length(10, 250)
  @JSONSchema({
    description:
      "A single message that summarizes the conversation including the most important points",
  })
  content: string;
}

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const { completions } = instructor(openAi);

const result = completions.create({
  ResponseModel: SummarizedConversation,
  maxRetries: 2,
  model: "gpt-3.5-turbo",
  messages: [
    ...conversation,
    {
      role: "user",
      content: `Please provide a concise summary of the conversation in this thread. 
      Focus on capturing the key topics discussed, any important details shared, and 
      the overall gist of the exchange. Your summary should be brief yet informative, 
      highlighting the main points and conclusions drawn from the conversation.`,
    },
  ],
});

result
  .then((r) => console.log("response", JSON.stringify(r, null, 2)))
  .catch((e) => console.log("error", JSON.stringify(e, null, 2)));
