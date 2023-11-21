import { Role } from "./role";

interface BaseMessage {
  role: Role;
  content: string;
}

export interface UserMessage extends BaseMessage {
  role: Role.USER;
}
export interface SystemMessage extends BaseMessage {
  role: Role.SYSTEM;
}
export interface AssistantMessage extends BaseMessage {
  role: Role.ASSISTANT;
}
export interface FunctionMessage<T> extends BaseMessage {
  role: Role.FUNCTION;
  name: T;
}

export type Message<T> =
  | UserMessage
  | SystemMessage
  | AssistantMessage
  | FunctionMessage<T>;
