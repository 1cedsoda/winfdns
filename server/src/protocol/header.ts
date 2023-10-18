import { DnsRequestFlags, decodeFlags } from "./flags";

export type DnsHeader = {
  transactionId: number;
  flags: DnsRequestFlags;
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
