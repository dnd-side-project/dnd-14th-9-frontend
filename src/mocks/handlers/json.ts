export class MockJsonParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MockJsonParseError";
  }
}

export function parseRequiredJsonText<T>(text: string, context: string): T {
  if (!text) {
    throw new MockJsonParseError(`${context} payload is required`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new MockJsonParseError(`${context} payload must be valid JSON`);
  }
}

export async function readRequiredJson<T>(request: Request, context: string): Promise<T> {
  return parseRequiredJsonText<T>(await request.text(), context);
}

export async function readRequiredMultipartJsonPart<T>(
  request: Request,
  key: string,
  context: string
): Promise<T> {
  const formData = await request.formData();
  const part = formData.get(key);
  if (!(part instanceof Blob)) {
    throw new MockJsonParseError(`${context} ${key} part is required`);
  }

  return parseRequiredJsonText<T>(await part.text(), context);
}

export async function requireMultipartPart(
  request: Request,
  key: string,
  context: string
): Promise<FormDataEntryValue> {
  const formData = await request.formData();
  const part = formData.get(key);
  if (!part) {
    throw new MockJsonParseError(`${context} ${key} part is required`);
  }

  return part;
}
