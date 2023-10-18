import { ResourceRecord } from "./zone";
import { RCode, DnsRequest, DnsResponse, encodeDnsResponse } from "./protocol";
import { RemoteInfo, Socket } from "dgram";

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

export function sendResponse(
  res: DnsResponse,
  rinfo: RemoteInfo,
  server: Socket
) {
  const buffer = encodeDnsResponse(res);
  server.send(buffer, rinfo.port, rinfo.address, (err) => {
    if (err) {
      console.error(err);
    }
  });
}
