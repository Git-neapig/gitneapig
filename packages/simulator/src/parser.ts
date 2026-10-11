import {
  commandOptions,
  commandRegistry,
  type CommandKey,
  type ParsedCommand,
  type SimulatorErrorCode,
} from "@gitneapig/shared";

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

// Tokenization is intentionally not shell execution: operators have no special meaning.
export function tokenize(raw: string): string[] {
  const tokens: string[] = [];
  let token = "",
    quote = "",
    escaping = false,
    started = false;
  for (const char of raw) {
    if (escaping) {
      token += char;
      escaping = false;
      started = true;
    } else if (char === "\\" && quote !== "'") {
      escaping = true;
      started = true;
    } else if (quote) {
      if (char === quote) quote = "";
      else token += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (/\s/.test(char)) {
      if (started) tokens.push(token);
      token = "";
      started = false;
    } else {
      token += char;
      started = true;
    }
  }
  if (quote || escaping)
    fail("INVALID_ARGUMENT", "Unterminated quote or escape.");
  if (started) tokens.push(token);
  return tokens;
}

export function parseCommand(raw: string): ParsedCommand {
  if (raw.length > 4096) fail("INVALID_ARGUMENT", "Command is too long.");
  const words = tokenize(raw.trim());
  if (words[0] === "git") words.shift();
  else if (words[0] !== "help")
    fail("UNKNOWN_COMMAND", "Use a supported git command, or help.");
  const name = words.shift();
  if (name === "help" || name === "--help") {
    if (words.length) fail("INVALID_ARGUMENT", "Usage: help");
    return { key: "help", args: [], options: {}, raw };
  }
  if (!commandRegistry.some((c) => c.key === name))
    fail("UNKNOWN_COMMAND", `Unsupported command: ${name ?? ""}. Type help.`);
  const key = name as CommandKey,
    options: ParsedCommand["options"] = {},
    args: string[] = [];
  let literal = false;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word === "--" && !literal) {
      literal = true;
      continue;
    }
    if (word.startsWith("-") && !literal) {
      const kind = commandOptions[key][word];
      if (!kind || word in options)
        fail("INVALID_ARGUMENT", `Unsupported or repeated option: ${word}`);
      if (kind === "flag") options[word] = true;
      else {
        if (words[i + 1] === undefined)
          fail("INVALID_ARGUMENT", `Missing value for ${word}`);
        options[word] = words[++i];
      }
    } else args.push(word);
  }
  const count: Record<CommandKey, [number, number]> = {
    status: [0, 0],
    add: [1, 64],
    commit: [0, 0],
    log: [0, 0],
    diff: [0, 0],
    branch: [0, 1],
    switch: [1, 1],
    checkout: [1, 1],
    merge: [1, 1],
    fetch: [0, 1],
    pull: [0, 2],
    push: [0, 2],
  };
  const [min, max] = count[key];
  if (
    args.length < min ||
    args.length > max ||
    args.some((a) => !a.length) ||
    (key === "commit" &&
      (typeof options["-m"] !== "string" || !options["-m"].trim())) ||
    (key === "branch" && options["-d"] && !args.length) ||
    ((key === "push" || key === "pull") && args.length === 1) ||
    (key === "push" && options["-u"] && args.length !== 2)
  )
    fail(
      "INVALID_ARGUMENT",
      `Usage: ${commandRegistry.find((c) => c.key === key)!.syntax.join(" | ")}`,
    );
  return { key, args, options, raw };
}
