import { ResourceRecord } from "./zone";
import { RCode, DnsRequestFlags, OpCode } from "./protocol/flags";
import { DnsRequest } from "./protocol/request";
import { DnsResponse } from "./protocol/response";

export function createDnsResponse(
  req: DnsRequest,
  answersRRs: ResourceRecord[],
  rcode: RCode
): DnsResponse {
  if (answersRRs.length !== req.header.questions) {
    throw new Error("Number of answers does not match number of questions");
  }
  return {
    header: {
      ...req.header,
      answerRRs: answersRRs.length,
      flags: {
        ...req.header.flags,
        qr: true,
        rcode,
      },
    },
    questions: req.questions,
    answers: answersRRs,
  };
}
