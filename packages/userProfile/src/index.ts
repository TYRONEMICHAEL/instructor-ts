import instructor from "@instructor-ts/instructor";
import { Type } from "class-transformer";
import {
  IsString,
  IsInt,
  IsOptional,
  ValidateNested,
  IsArray,
} from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import OpenAI from "openai";
import "dotenv/config";

class DynamicContext {
  @IsString()
  @JSONSchema({
    description:
      "Category Key representing the type of context (e.g., 'interests', 'specialization')",
  })
  category: string;

  @IsArray()
  @IsString({ each: true })
  @JSONSchema({
    description:
      "Values associated with the context key. Can be multiple values.",
    examples: [["blockchain"], ["AI", "Machine Learning"]],
  })
  value: string[];

  constructor(key: string, value?: string[]) {
    this.category = key;
    this.value = value || [];
  }
}

class UserProfile {
  @IsString()
  @JSONSchema({ description: "The user's name", examples: ["John Doe"] })
  name: string;

  @IsInt()
  @JSONSchema({ description: "The user's age", examples: [30] })
  age: number;

  @IsString()
  @IsOptional()
  @JSONSchema({
    description: "Primary role or occupation of the user",
    examples: ["Software Engineer"],
  })
  primaryRole?: string;

  @ValidateNested({ each: true })
  @Type(() => DynamicContext)
  @JSONSchema({
    description:
      "Dynamic context providing additional information about the user",
    examples: [{ category: "hobbies", value: ["Coding", "Hiking"] }],
  })
  dynamicContext: DynamicContext[];

  constructor(
    name: string,
    age: number,
    primaryRole?: string,
    dynamicContext: DynamicContext[] = [],
  ) {
    this.name = name;
    this.age = age;
    this.primaryRole = primaryRole;
    this.dynamicContext = dynamicContext;
  }
}

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const { completions } = instructor(openAi);

const result = completions.create({
  ResponseModel: UserProfile,
  maxRetries: 1,
  model: "gpt-4-1106-preview",
  messages: [
    {
      role: "user",
      content: `Extract the following user profile: My name is Tyrone Avnit. 
      I am a professional software engineer, 37 years old. I specialize in 
      blockchain but have a deep interest in working with AI, specifically LLMs. 
      I feel most empowered and happiest when I am learning. My preferred programming 
      languages are Swift and TypeScript. To feel fulfilled, I need to be deeply 
      engaged in learning something new every day, while also working out intensely for an 
      hour. Additionally, I like to do meditation to calm my mind. I find that I can suffer 
      from anxiety, and since I work remotely, getting out and doing things is essential to 
      prevent feeling down.`,
    },
  ],
});

result
  .then((r) => console.log("response", JSON.stringify(r, null, 2)))
  .catch((e) => console.log("error", JSON.stringify(e, null, 2)));
