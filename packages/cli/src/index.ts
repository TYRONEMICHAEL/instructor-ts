import { build as buildWith } from "@instructor-ts/instructor";
import { CompletionsApi } from "@instructor-ts/completions-api";

class UserDetail {
  constructor(
    readonly name: string,
    readonly age: number,
  ) {}
}

const instructor = buildWith([new CompletionsApi()]);
const result = instructor.completions.create({
  responseModel: UserDetail,
  model: "",
  messages: [],
});

console.log(result);
