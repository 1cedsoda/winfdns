import { decodeName, encodeName } from "./name";
import {
  decodeResourceType,
  decodeResourceClass,
  encodeResourceType,
  encodeResourceClass,
  ResourceType,
  ResourceClass,
} from "./resource_record";

export type DnsQuestion = {
  name: string; // domain name
  type: ResourceType; // type of query (1 = A, 2 = NS, 5 = CNAME, 6 = SOA, 12 = PTR, 15 = MX, 16 = TXT)
  class: ResourceClass; // class of query (1 = IN, 2 = CS, 3 = CH, 4 = HS)
  length: number;
};

export function decodeQuestions(
  buffer: Buffer,
  questions: number
): DnsQuestion[] {
  let offset = 12;
  const decodedQuestions = [];
  for (let i = 0; i < questions; i++) {
    const question = decodeQuestion(buffer, offset);
    decodedQuestions.push(question);
    offset += question.length;
  }
  return decodedQuestions;
}

function decodeQuestion(buffer: Buffer, offset: number): DnsQuestion {
  let new_offset = offset;
  const name = decodeName(buffer, offset);
  new_offset += name.length + 2;
  const type = buffer.readUInt16BE(new_offset);
  new_offset += 2;
  const klass = buffer.readUInt16BE(new_offset);
  new_offset += 2;
  const length = new_offset - offset;
  return {
    name,
    type: decodeResourceType(type),
    class: decodeResourceClass(klass),
    length,
  };
}

export function encodeQuestions(
  questions: DnsQuestion[],
  buffer: Buffer,
  offset: number
): number {
  for (const question of questions) {
    offset = encodeName(question.name, buffer, offset);
    buffer.writeUInt16BE(encodeResourceType(question.type), offset);
    offset += 2;
    buffer.writeUInt16BE(encodeResourceClass(question.class), offset);
    offset += 2;
  }
  return offset;
}
