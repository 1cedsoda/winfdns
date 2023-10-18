import { ResourceRecord } from "./zone";
import {
  ResponseCode,
  DnsRequest,
  DnsResponse,
  encodeDnsResponse,
} from "./protocol";
import { RemoteInfo, Socket } from "dgram";

export function createDnsResponse(
  req: DnsRequest,
  answersRRs: ResourceRecord[],
  rcode: ResponseCode
): DnsResponse {
  return {
    header: {
      ...req.header,
      answerRRs: answersRRs.length,
      flags: {
        ...req.header.flags,
        isResponse: true,
        responseCode: rcode,
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
