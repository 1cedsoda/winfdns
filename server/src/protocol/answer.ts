import { ResourceRecord } from "../zone";
import { decodeName, encodeName } from "./name";
import {
  encodeResourceType,
  encodeResourceClass,
  decodeResourceType,
  decodeResourceClass,
} from "./resource_record";

export function encodeAnswers(
  answers: ResourceRecord[],
  buffer: Buffer,
  offset: number
): number {
  for (const answer of answers) {
    offset = encodeName(answer.name, buffer, offset);
    buffer.writeUInt16BE(encodeResourceType(answer.type), offset);
    offset += 2;
    buffer.writeUInt16BE(encodeResourceClass(answer.class), offset);
    offset += 2;
    buffer.writeUInt32BE(answer.ttl, offset);
    offset += 4;
    buffer.writeUInt16BE(answer.data.length, offset);
    offset += 2;
    offset += buffer.write(answer.data, offset, "ascii");
  }
  return offset;
}

export function decodeAnswers(buffer: Buffer, count: number): ResourceRecord[] {
  const answers: ResourceRecord[] = [];
  let offset = 12;
  for (let i = 0; i < count; i++) {
    const name = decodeName(buffer, offset);
    offset += name.length + 2;
    const type = buffer.readUInt16BE(offset);
    offset += 2;
    const cls = buffer.readUInt16BE(offset);
    offset += 2;
    const ttl = buffer.readUInt32BE(offset);
    offset += 4;
    const length = buffer.readUInt16BE(offset);
    offset += 2;
    const data = buffer.toString("ascii", offset, offset + length);
    offset += length;
    answers.push({
      name,
      type: decodeResourceType(type),
      class: decodeResourceClass(cls),
      ttl,
      data,
    });
  }
  return answers;
}
