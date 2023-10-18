import { ResourceRecord } from "./zone";
import { ResponseCode, DnsPacket, encodePacket } from "./protocol";
import { RemoteInfo, Socket } from "dgram";

export function createDnsResponse(
  req: DnsPacket,
  answersRRs: ResourceRecord[],
  rcode: ResponseCode
): DnsPacket {
  return {
    header: {
      transactionId: req.header.transactionId,
      flags: {
        ...req.header.flags,
        isResponse: true,
        responseCode: rcode,
      },
      questions: req.header.questions,
      answerRRs: answersRRs.length,
      authorityRRs: 0,
      additionalRRs: 0,
    },
    questions: req.questions,
    answers: answersRRs,
  };
}

export function sendResponse(
  res: DnsPacket,
  rinfo: RemoteInfo,
  server: Socket
) {
  const buffer = encodePacket(res);
  server.send(buffer, rinfo.port, rinfo.address, (err) => {
    if (err) {
      console.error(err);
    }
  });
}
