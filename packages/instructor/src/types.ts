export type Constructor<T> = new (...args: unknown[]) => T;

export enum SupportedCapabilities {
  Completions = "completions",
  Files = "files",
  Assistants = "assistants",
}

export type CapabilityRequest<T, M> = T & { responseModel: Constructor<M> };

export interface Capability<T, M> {
  name: SupportedCapabilities;
  create: (request: CapabilityRequest<T, M>) => M;
}

export type Capabilities<T, M> = {
  [K in SupportedCapabilities]?: {
    create: (request: T & { responseModel: Constructor<M> }) => M;
  };
};
