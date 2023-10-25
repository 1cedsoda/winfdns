import { UsedNames, decodeName, encodeName, encodedNameBytes } from "./name";
import { encodeIpv4 } from "./ipv4";

export function encodeResourceRecords(
  resourceRecords: ResourceRecord[],
  buffer: Buffer,
  offset: number,
  usedNames: UsedNames
): number {
  for (const answer of resourceRecords) {
    offset = encodeName(answer.name, buffer, offset, usedNames);
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
      offset = encodeDataNS(answer.data, buffer, offset, usedNames);
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

function decodeDataTXT(
  buffer: Buffer,
  offset: number
): [string, offset: number] {
  const dataLength = buffer.readUInt8(offset);
  offset += 2;
  const txtLength = buffer.readUInt8(offset);
  offset += 1;
  const txt = buffer.toString("ascii", offset, offset + txtLength);
  offset += txtLength;
  return [txt, offset];
}

function encodeDataA(data: string, buffer: Buffer, offset: number): number {
  // Data size
  buffer.writeUInt16BE(4, offset);
  offset += 2;
  // ipv4
  offset = encodeIpv4(data, buffer, offset);
  return offset;
}

function decodeDataA(buffer: Buffer, offset: number): [string, offset: number] {
  const ip = [
    buffer.readUInt8(offset),
    buffer.readUInt8(offset + 1),
    buffer.readUInt8(offset + 2),
    buffer.readUInt8(offset + 3),
  ].join(".");
  offset += 4;
  return [ip, offset];
}

function encodeDataNS(
  data: string,
  buffer: Buffer,
  offset: number,
  usedNames: UsedNames
): number {
  // Space for Data size
  offset += 2;
  // Write name
  offset = encodeName(data, buffer, offset, usedNames);
  // Write data size
  const nameBytes = encodedNameBytes(data);
  buffer.writeUInt16BE(nameBytes, offset - nameBytes - 2);
  return offset;
}

function decodeDataNS(
  buffer: Buffer,
  offset: number
): [string, offset: number] {
  const length = buffer.readUInt16BE(offset);
  offset += 2;
  const [name, offset_after] = decodeName(buffer, offset);
  return [name, offset_after];
}

export function decodeResourceRecords(
  buffer: Buffer,
  count: number,
  offset: number
): [ResourceRecord[], offset: number] {
  if (count === 0) {
    return [[], offset];
  }
  const rr: ResourceRecord[] = [];
  for (let i = 0; i < count; i++) {
    const [name, offset_after_name] = decodeName(buffer, offset);
    offset = offset_after_name;
    const type = decodeResourceType(buffer.readUInt16BE(offset));
    offset += 2;
    const cls =
      type == "OPT" ? null : decodeResourceClass(buffer.readUInt16BE(offset));
    offset += 2;
    const ttl = buffer.readUInt32BE(offset);
    offset += 4;
    const length = buffer.readUInt16BE(offset);
    offset += 2;
    let data: string;
    if (type === "TXT") [data, offset] = decodeDataTXT(buffer, offset);
    else if (type === "A") [data, offset] = decodeDataA(buffer, offset);
    else if (type === "NS") [data, offset] = decodeDataNS(buffer, offset);
    else console.log(`Unsupported RR type: ${type}`);
    offset += length;
    rr.push({
      name,
      type,
      class: cls,
      ttl,
      data,
    });
  }
  return [rr, offset];
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
  class: ResourceClass | null;
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
export type ResourceType =
  | "A"
  | "NS"
  | "CNAME"
  | "SOA"
  | "PTR"
  | "MX"
  | "TXT"
  | "OPT";

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
    case 41:
      return "OPT";
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
    case "OPT":
      return 41;
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
