import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { Capabilities, Capability, SupportedCapabilities } from "./types";
import OpenAI from "openai";

export const build = <T, M>(
  capabilities: Capability<T, M>[],
  apiKey: string,
): Capabilities<T, M> => {
  const openai = new OpenAI({ apiKey });
  const result: Capabilities<T, M> = {};

  capabilities.forEach((c) => {
    const create = c.create.bind(c);

    c.create = (openai) => {
      return async (request) => {
        const schemas = validationMetadatasToSchemas();
        const name = request.responseModel.name;
        const schema = schemas[name];
        const transformedRequest = {
          ...request,
          tools: [
            {
              type: "function",
              function: {
                name,
                description: `Correctly extract ${name} with all the required parameters and the correct types`,
                parameters: schema as Record<string, unknown>,
              },
            },
          ],
          tool_choice: "auto",
        };

        // Call the original create method with the transformed request
        return await create(openai)(transformedRequest);
      };
    };

    const name = c.name as SupportedCapabilities;
    result[name] = { create: c.create(openai) };
  });

  return result;
};
