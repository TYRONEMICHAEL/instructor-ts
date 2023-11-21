import { Role, build as buildWith } from "@instructor-ts/instructor";
import { CompletionsApi } from "@instructor-ts/completions-api";
import { IsString, IsIn } from "class-validator";
import { config } from "dotenv";
import { JSONSchema } from "class-validator-jsonschema";

config();

class Labels {
  @IsIn(["SPAM", "NOT_SPAM"])
  labels?: string;

  @IsString()
  @JSONSchema({
    description: "Description why this was classified as SPAM or NOT_SPAM",
  })
  description: string;
}

const instructor = buildWith(
  [new CompletionsApi()],
  process.env.OPENAI_API_KEY,
);

const result = instructor.completions.create({
  responseModel: Labels,
  model: process.env.OPENAI_MODEL,
  messages: [
    {
      role: Role.USER,
      content:
        "Classify the following text: Hello, my name is John and I am 20 years old nigerian prince",
    },
  ],
});

result.then((r) => console.log(r));
