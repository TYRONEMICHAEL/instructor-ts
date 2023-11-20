import { Capabilities, Capability, CapabilityNames } from "./types";

export const build = <T, M>(
  capabilities: Capability<T, M>[],
): Capabilities<T, M> => {
  const result: Capabilities<T, M> = {};

  capabilities.forEach((c) => {
    const name = c.name as CapabilityNames; // Type assertion
    result[name] = { create: c.create };
  });

  return result;
};
