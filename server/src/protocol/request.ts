import { DnsHeader, decodeHeader } from "./header";
import { DnsQuestion, decodeQuestions } from "./question";

export type DnsRequest = {
  header: DnsHeader;
  questions: DnsQuestion[];
};

export function decodeDnsRequest(buffer: Buffer): DnsRequest {
  const header = decodeHeader(buffer);
  const questions = decodeQuestions(buffer, header.questions);
  return {
    header,
    questions,
  };
}
