import { ResourceRecord } from "../zone";
import { decodeAnswers, encodeAnswers } from "./answer";
import { encodeFlags } from "./flags";
import { DnsHeader, decodeHeader } from "./header";

export type DnsResponse = {
  header: DnsHeader;
  answers: ResourceRecord[];
};

export function encodeDnsResponse(res: DnsResponse): Buffer {
  const buffer = Buffer.alloc(512);
  let offset = 0;
  offset = encodeHeader(res.header, buffer, offset);
  offset = encodeAnswers(res.answers, buffer, offset);

  // crop the buffer to the actual size
  const result = Buffer.alloc(offset);
  buffer.copy(result, 0, 0, offset);
  return result;
}

function encodeHeader(
  header: DnsHeader,
  buffer: Buffer,
  offset: number
): number {
  buffer.writeUInt16BE(header.transactionId, offset);
  offset += 2;
  const flags = encodeFlags(header.flags);
  buffer.writeUInt16BE(flags, offset);
  offset += 2;
  buffer.writeUInt16BE(header.questions, offset);
  offset += 2;
  buffer.writeUInt16BE(header.answerRRs, offset);
  offset += 2;
  buffer.writeUInt16BE(header.authorityRRs, offset);
  offset += 2;
  buffer.writeUInt16BE(header.additionalRRs, offset);
  offset += 2;
  return offset;
}

export function decodeDnsResponse(buffer: Buffer): DnsResponse {
  const header = decodeHeader(buffer);
  const answers = decodeAnswers(buffer, header.answerRRs);
  return { header, answers };
}
