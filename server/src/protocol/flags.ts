export type DnsFlags = {
  isResponse: boolean; // 0 = query, 1 = response
  operation: Operation; // type of query
  authoritativeAnswer: boolean; // authoritative answer
  truncated: boolean; // truncated
  recursionDesired: boolean; // recursion desired
  recursionAvailable: boolean; // recursion available
  z: number; // reserved for future use
  responseCode: ResponseCode;
};

export type Operation =
  | "standard query"
  | "inverse query"
  | "server status request";

export type ResponseCode =
  | "no error"
  | "format error"
  | "server failure"
  | "name error"
  | "not implemented"
  | "refused";

// Flags
// isResponse: 1 bit (0 = query, 1 = response)
// opcode: 4 bits (0 = standard query, 1 = inverse query, 2 = server status request)
// authoritativeAnswer: 1 bit (authoritative answer)
// truncated: 1 bit (truncated)
// recursionDesired: 1 bit (recursion desired)
// recursionAvailable: 1 bit (recursion available)
// z: 3 bits (reserved for future use)
// rcode: 4 bits (0 = no error, 1 = format error, 2 = server failure, 3 = name error, 4 = not implemented, 5 = refused)
export function decodeFlags(buffer: Buffer): DnsFlags {
  const flags = buffer.readUInt16BE(2);
  const isResponse = (flags & 0b1000000000000000) > 0;
  const opcode = (flags & 0b0111100000000000) >> 11;
  const authoritativeAnswer = (flags & 0b0000010000000000) > 0;
  const truncated = (flags & 0b0000001000000000) > 0;
  const recursionDesired = (flags & 0b0000000100000000) > 0;
  const recursionAvailable = (flags & 0b0000000010000000) > 0;
  const z = (flags & 0b0000000001110000) >> 4;
  const rcode = flags & 0b0000000000001111;
  return {
    isResponse,
    operation: decodeOpCode(opcode),
    authoritativeAnswer,
    truncated,
    recursionDesired,
    recursionAvailable,
    z,
    responseCode: decodeRCode(rcode),
  };
}

export function encodeFlags(flags: DnsFlags): number {
  let result = 0;
  result |= flags.isResponse ? 1 << 15 : 0;
  result |= encodeOpCode(flags.operation) << 11;
  result |= flags.authoritativeAnswer ? 1 << 10 : 0;
  result |= flags.truncated ? 1 << 9 : 0;
  result |= flags.recursionDesired ? 1 << 8 : 0;
  result |= flags.recursionAvailable ? 1 << 7 : 0;
  result |= flags.z << 4;
  result |= encodeRCode(flags.responseCode);
  return result;
}

export function decodeOpCode(opcode: number): Operation {
  switch (opcode) {
    case 0:
      return "standard query";
    case 1:
      return "inverse query";
    case 2:
      return "server status request";
    default:
      throw new Error(`Unknown opcode ${opcode}`);
  }
}

function encodeOpCode(opcode: Operation): number {
  switch (opcode) {
    case "standard query":
      return 0;
    case "inverse query":
      return 1;
    case "server status request":
      return 2;
    default:
      throw new Error(`Unknown OpCode ${opcode}`);
  }
}

export function decodeRCode(rcode: number): ResponseCode {
  switch (rcode) {
    case 0:
      return "no error";
    case 1:
      return "format error";
    case 2:
      return "server failure";
    case 3:
      return "name error";
    case 4:
      return "not implemented";
    case 5:
      return "refused";
    default:
      throw new Error(`Unknown rcode ${rcode}`);
  }
}

function encodeRCode(rcode: ResponseCode): number {
  switch (rcode) {
    case "no error":
      return 0;
    case "format error":
      return 1;
    case "server failure":
      return 2;
    case "name error":
      return 3;
    case "not implemented":
      return 4;
    case "refused":
      return 5;
    default:
      throw new Error(`Unknown RCode ${rcode}`);
  }
}
