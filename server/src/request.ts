import { debugHex } from "./console.hex";

export type DnsRequest = {
  header: DnsRequestHeader;
  questions: DnsRequestQuestion[];
};

export type DnsRequestHeader = {
  transactionId: number;
  flags: DnsRequestFlags;
  questions: number;
  answerRRs: number;
  authorityRRs: number;
  additionalRRs: number;
};

export type DnsRequestFlags = {
  qr: boolean; // 0 = query, 1 = response
  opcode: OpCode; // type of query
  aa: boolean; // authoritative answer
  tc: boolean; // truncated
  rd: boolean; // recursion desired
  ra: boolean; // recursion available
  z: number; // reserved for future use
  rcode: RCode;
};

export type OpCode =
  | "standard query"
  | "inverse query"
  | "server status request";

export type RCode =
  | "no error"
  | "format error"
  | "server failure"
  | "name error"
  | "not implemented"
  | "refused";

export type DnsRequestQuestion = {
  name: string; // domain name
  type: QuestionType; // type of query (1 = A, 2 = NS, 5 = CNAME, 6 = SOA, 12 = PTR, 15 = MX, 16 = TXT)
  klass: QuestionClass; // class of query (1 = IN, 2 = CS, 3 = CH, 4 = HS)
  length: number;
};

// A = IPv4 address
// NS = authoritative name server
// CNAME = canonical name for an alias
// SOA = marks the start of a zone of authority
// PTR = domain name pointer
// MX = mail exchange
// TXT = text strings
export type QuestionType = "A" | "NS" | "CNAME" | "SOA" | "PTR" | "MX" | "TXT";

// IN = internet
// CS = CSNET (obsolete)
// CH = CHAOS (obsolete)
// HS = Hesiod (obsolete)
export type QuestionClass = "IN" | "CS" | "CH" | "HS";

export function parseDnsRequest(buffer: Buffer): DnsRequest {
  const header = parseHeader(buffer);
  const questions = parseQuestions(buffer, header.questions);
  return {
    header,
    questions,
  };
}

function parseHeader(buffer: Buffer): DnsRequestHeader {
  const transactionId = buffer.readUInt16BE(0);
  const flags = parseFlags(buffer);
  const questions = buffer.readUInt16BE(4);
  const answerRRs = buffer.readUInt16BE(6);
  const authorityRRs = buffer.readUInt16BE(8);
  const additionalRRs = buffer.readUInt16BE(10);
  return {
    transactionId,
    flags,
    questions,
    answerRRs,
    authorityRRs,
    additionalRRs,
  };
}

// Flags
// qr: 1 bit (0 = query, 1 = response)
// opcode: 4 bits (0 = standard query, 1 = inverse query, 2 = server status request)
// aa: 1 bit (authoritative answer)
// tc: 1 bit (truncated)
// rd: 1 bit (recursion desired)
// ra: 1 bit (recursion available)
// z: 3 bits (reserved for future use)
// rcode: 4 bits (0 = no error, 1 = format error, 2 = server failure, 3 = name error, 4 = not implemented, 5 = refused)
function parseFlags(buffer: Buffer): DnsRequestFlags {
  const flags = buffer.readUInt16BE(2);
  const qr = (flags & 0b1000000000000000) > 0;
  const opcode = (flags & 0b0111100000000000) >> 11;
  const aa = (flags & 0b0000010000000000) > 0;
  const tc = (flags & 0b0000001000000000) > 0;
  const rd = (flags & 0b0000000100000000) > 0;
  const ra = (flags & 0b0000000010000000) > 0;
  const z = (flags & 0b0000000001110000) >> 4;
  const rcode = flags & 0b0000000000001111;
  return {
    qr,
    opcode: parseOpCode(opcode),
    aa,
    tc,
    rd,
    ra,
    z,
    rcode: parseRCode(rcode),
  };
}

function parseOpCode(opcode: number): OpCode {
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

function parseRCode(rcode: number): RCode {
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

function parseQuestions(
  buffer: Buffer,
  questions: number
): DnsRequestQuestion[] {
  let offset = 12;
  const parsedQuestions = [];
  for (let i = 0; i < questions; i++) {
    const question = parseQuestion(buffer, offset);
    parsedQuestions.push(question);
    offset += question.length;
  }
  return parsedQuestions;
}

function parseQuestion(buffer: Buffer, offset: number): DnsRequestQuestion {
  let new_offset = offset;
  const { name } = parseName(buffer, offset);
  new_offset += name.length + 2;
  const type = buffer.readUInt16BE(new_offset);
  new_offset += 2;
  const klass = buffer.readUInt16BE(new_offset);
  new_offset += 2;
  const length = new_offset - offset;
  return {
    name,
    type: parseQuestionType(type),
    klass: parseQuestionClass(klass),
    length,
  };
}

function parseName(
  buffer: Buffer,
  offset: number
): { name: string; length: number } {
  let name = "";
  let length = buffer.readUInt8(offset);
  while (length > 0) {
    if (name.length > 0) {
      name += ".";
    }
    name += buffer.toString("utf8", offset + 1, offset + 1 + length);
    offset += 1 + length;
    length = buffer.readUInt8(offset);
  }
  return {
    name,
    length: offset - offset + 1 + length,
  };
}

function parseQuestionType(type: number): QuestionType {
  switch (type) {
    case 1:
      return "A";
    case 2:
      return "NS";
    case 5:
      return "CNAME";
    case 6:
      return "SOA";
    case 12:
      return "PTR";
    case 15:
      return "MX";
    case 16:
      return "TXT";
    default:
      throw new Error(`Unknown question type ${type}`);
  }
}

function parseQuestionClass(klass: number): QuestionClass {
  switch (klass) {
    case 1:
      return "IN";
    case 2:
      return "CS";
    case 3:
      return "CH";
    case 4:
      return "HS";
    default:
      throw new Error(`Unknown question class ${klass}`);
  }
}
