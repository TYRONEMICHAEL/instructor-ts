export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const ret = { ...obj };
  keys.forEach((key) => {
    delete ret[key];
  });
  return ret;
}

export function withContextUpdates<A, B, C>(
  fn: (input: A) => Promise<B>,
  handler: (context: C, result: B) => C = (context) => context,
): (contextAndInput: [C, A]) => Promise<[C, B]> {
  return async (contextAndInput: [C, A]): Promise<[C, B]> => {
    const [context, input] = contextAndInput;
    return fn(input)
      .then((result) => [handler(context, result), result] as [C, B])
      .catch((error) => {
        throw [error, context];
      });
  };
}

export function identity<T>(x: T): T {
  return x;
}
