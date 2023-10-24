import { DnsFlags, decodeFlags, encodeFlags } from "./flags";

export type DnsHeader = {
  transactionId: number;
  flags: DnsFlags;
  questions: number;
  answerRRs: number;
  authorityRRs: number;
  additionalRRs: number;
};

export function decodeHeader(buffer: Buffer): DnsHeader {
  const transactionId = buffer.readUInt16BE(0);
  const flags = decodeFlags(buffer);
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

export function encodeHeader(
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
