import { decodeName, encodeName, encodedNameBytes } from "./name";
import { encodeIpv4 } from "./ipv4";
import { debugHex } from "../hex";

export function encodeResourceRecords(
  resourceRecords: ResourceRecord[],
  buffer: Buffer,
  offset: number
): number {
  for (const answer of resourceRecords) {
    offset = encodeName(answer.name, buffer, offset);
    buffer.writeUInt16BE(encodeResourceType(answer.type), offset);
    offset += 2;
    buffer.writeUInt16BE(encodeResourceClass(answer.class), offset);
    offset += 2;
    buffer.writeUInt32BE(answer.ttl, offset);
    offset += 4;
    if (answer.type === "TXT")
      offset = encodeDataTXT(answer.data, buffer, offset);
    else if (answer.type === "A")
      offset = encodeDataA(answer.data, buffer, offset);
    else if (answer.type === "NS")
      offset = encodeDataNS(answer.data, buffer, offset);
    else throw new Error(`Unsupported answer type: ${answer.type}`);
  }
  return offset;
}

function encodeDataTXT(data: string, buffer: Buffer, offset: number): number {
  // Data size
  buffer.writeUInt16BE(data.length + 1, offset);
  offset += 2;
  // Txt size
  buffer.writeUInt8(data.length, offset);
  offset += 1;
  // Txt data
  buffer.write(data, offset, "ascii");
  offset += data.length;
  return offset;
}

function encodeDataA(data: string, buffer: Buffer, offset: number): number {
  // Data size
  buffer.writeUInt16BE(4, offset);
  offset += 2;
  // ipv4
  offset = encodeIpv4(data, buffer, offset);
  return offset;
}

function encodeDataNS(data: string, buffer: Buffer, offset: number): number {
  // Space for Data size
  offset += 2;
  // Write name
  offset = encodeName(data, buffer, offset);
  // Write data size
  const nameBytes = encodedNameBytes(data);
  buffer.writeUInt16BE(nameBytes, offset - nameBytes - 2);
  return offset;
}

export function decodeResourceRecords(
  buffer: Buffer,
  count: number
): ResourceRecord[] {
  if (count === 0) {
    return [];
  }
  const answers: ResourceRecord[] = [];
  let offset = 12;
  for (let i = 0; i < count; i++) {
    const name = decodeName(buffer, offset);
    offset += name.length + 2;
    const type = decodeResourceType(buffer.readUInt16BE(offset));
    offset += 2;
    const cls = decodeResourceClass(buffer.readUInt16BE(offset));
    offset += 2;
    const ttl = buffer.readUInt32BE(offset);
    offset += 4;
    const length = buffer.readUInt16BE(offset);
    offset += 2;
    let data = "";
    if (type === "TXT") {
      // TXT records have a extra 1-byte length prefix
      offset += 1;
      data = buffer.toString("ascii", offset, offset + length - 1);
    } else {
      data = buffer.toString("ascii", offset, offset + length);
    }
    offset += length;
    answers.push({
      name,
      type,
      class: cls,
      ttl,
      data,
    });
  }
  return answers;
}

export type ResourceRecords = {
  answerRRs: ResourceRecord[];
  authorityRRs: ResourceRecord[];
  additionalRRs: ResourceRecord[];
};

export const emptyResourceRecords: ResourceRecords = {
  answerRRs: [],
  authorityRRs: [],
  additionalRRs: [],
};

export type ResourceRecord = {
  name: string;
  type: ResourceType;
  class: ResourceClass;
  ttl: number;
  data: string;
};

export function mergeResourceRecods(a: ResourceRecords, b: ResourceRecords) {
  return {
    answerRRs: [...a.answerRRs, ...b.answerRRs],
    authorityRRs: [...a.authorityRRs, ...b.authorityRRs],
    additionalRRs: [...a.additionalRRs, ...b.additionalRRs],
  };
}

// A = IPv4 address
// NS = authoritative name server
// CNAME = canonical name for an alias
// SOA = marks the start of a zone of authority
// PTR = domain name pointer
// MX = mail exchange
// TXT = text strings
export type ResourceType = "A" | "NS" | "CNAME" | "SOA" | "PTR" | "MX" | "TXT";

// IN = internet
// CS = CSNET (obsolete)
// CH = CHAOS (obsolete)
// HS = Hesiod (obsolete)
export type ResourceClass = "IN" | "CS" | "CH" | "HS";

export function decodeResourceType(type: number): ResourceType {
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

export function decodeResourceClass(klass: number): ResourceClass {
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

export function encodeResourceType(type: ResourceType): number {
  switch (type) {
    case "A":
      return 1;
    case "NS":
      return 2;
    case "CNAME":
      return 5;
    case "SOA":
      return 6;
    case "PTR":
      return 12;
    case "MX":
      return 15;
    case "TXT":
      return 16;
    default:
      throw new Error(`Unknown question type ${type}`);
  }
}

export function encodeResourceClass(_class: ResourceClass): number {
  switch (_class) {
    case "IN":
      return 1;
    case "CS":
      return 2;
    case "CH":
      return 3;
    case "HS":
      return 4;
    default:
      throw new Error(`Unknown question class ${_class}`);
  }
}
