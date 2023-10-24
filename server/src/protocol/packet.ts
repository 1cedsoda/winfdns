import { DnsHeader, decodeHeader, encodeHeader } from "./header";
import { DnsQuestion, decodeQuestions, encodeQuestions } from "./question";
import {
  ResourceRecords,
  decodeResourceRecords,
  encodeResourceRecords,
} from "./resource_record";

export type DnsPacket = {
  header: DnsHeader;
  questions: DnsQuestion[];
} & ResourceRecords;

export function encodePacket(res: DnsPacket): Buffer {
  const buffer = Buffer.alloc(512);
  let offset = 0;
  offset = encodeHeader(res.header, buffer, offset);
  if (res.header.questions > 0) {
    offset = encodeQuestions(res.questions, buffer, offset);
  }
  if (res.header.answerRRs > 0) {
    offset = encodeResourceRecords(res.answerRRs, buffer, offset);
  }
  if (res.header.authorityRRs > 0) {
    offset = encodeResourceRecords(res.authorityRRs, buffer, offset);
  }
  if (res.header.additionalRRs > 0) {
    offset = encodeResourceRecords(res.additionalRRs, buffer, offset);
  }

  // crop the buffer to the actual size
  const result = Buffer.alloc(offset);
  buffer.copy(result, 0, 0, offset);
  return result;
}

export function decodePacket(buffer: Buffer): DnsPacket {
  const header = decodeHeader(buffer);
  const questions = decodeQuestions(buffer, header.questions);
  const answerRRs = decodeResourceRecords(buffer, header.answerRRs);
  const authorityRRs = decodeResourceRecords(buffer, header.authorityRRs);
  const additionalRRs = decodeResourceRecords(buffer, header.additionalRRs);

  return { header, questions, answerRRs, authorityRRs, additionalRRs };
}
