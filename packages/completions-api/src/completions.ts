import {
  Capability,
  Constructor,
  SupportedCapabilities,
} from "@instructor-ts/instructor";

import { CompletionsRequest } from "./types";

class CompletionsApi<M> implements Capability<CompletionsRequest, M> {
  name = SupportedCapabilities.Completions;
  create(request: CompletionsRequest & { responseModel: Constructor<M> }) {
    return new request.responseModel();
  }
}

export default CompletionsApi;
