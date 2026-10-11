import type { SimulatorErrorCode } from "@gitneapig/shared";

export class CommandError extends Error {
  constructor(
    public readonly code: SimulatorErrorCode,
    message: string,
  ) {
    super(message);
  }
}
export function fail(code: SimulatorErrorCode, message: string): never {
  throw new CommandError(code, message);
}

