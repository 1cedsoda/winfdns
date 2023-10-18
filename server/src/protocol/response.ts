import { ResourceRecord } from "../zone";
import { decodeAnswers, encodeAnswers } from "./answer";
import { decodeHeader, encodeHeader } from "./header";
import { decodeQuestions, encodeQuestions } from "./question";
import { DnsRequest } from "./request";

export type DnsResponse = DnsRequest & {
  answers: ResourceRecord[];
};

export function encodeDnsResponse(res: DnsResponse): Buffer {
  const buffer = Buffer.alloc(512);
  let offset = 0;
  offset = encodeHeader(res.header, buffer, offset);
  offset = encodeQuestions(res.questions, buffer, offset);
  offset = encodeAnswers(res.answers, buffer, offset);

  // crop the buffer to the actual size
  const result = Buffer.alloc(offset);
  buffer.copy(result, 0, 0, offset);
  return result;
}

export function decodeDnsResponse(buffer: Buffer): DnsResponse {
  const header = decodeHeader(buffer);
  const questions = decodeQuestions(buffer, header.questions);
  const answers = decodeAnswers(buffer, header.answerRRs);
  return { header, questions, answers };
}
