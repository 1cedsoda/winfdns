import { ResourceRecord } from "../zone";
import { decodeAnswers, encodeAnswers } from "./answer";
import { DnsHeader, decodeHeader, encodeHeader } from "./header";
import { DnsQuestion, decodeQuestions, encodeQuestions } from "./question";

export type DnsPacket = {
  header: DnsHeader;
  questions: DnsQuestion[];
  answers: ResourceRecord[];
};

export function encodePacket(res: DnsPacket): Buffer {
  const buffer = Buffer.alloc(512);
  let offset = 0;
  offset = encodeHeader(res.header, buffer, offset);
  if (res.header.questions > 0) {
    offset = encodeQuestions(res.questions, buffer, offset);
  }
  if (res.header.answerRRs > 0) {
    offset = encodeAnswers(res.answers, buffer, offset);
  }

  // crop the buffer to the actual size
  const result = Buffer.alloc(offset);
  buffer.copy(result, 0, 0, offset);
  return result;
}

export function decodePacket(buffer: Buffer): DnsPacket {
  const header = decodeHeader(buffer);
  const questions = decodeQuestions(buffer, header.questions);
  const answers = decodeAnswers(buffer, header.answerRRs);
  return { header, questions, answers };
}
