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
    if (answer.type === "TXT") {
      // TXT records have a extra 1-byte length prefix
      buffer.writeUInt16BE(answer.data.length + 1, offset);
      offset += 2;
      buffer.writeUInt8(answer.data.length, offset);
      offset += 1;
    } else {
      buffer.writeUInt16BE(answer.data.length, offset);
      offset += 2;
    }
    offset += buffer.write(answer.data, offset, "ascii");
  }
  return offset;
}

export function decodeAnswers(buffer: Buffer, count: number): ResourceRecord[] {
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
