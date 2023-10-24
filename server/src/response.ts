import {
  ResponseCode,
  DnsPacket,
  encodePacket,
  ResourceRecords,
} from "./protocol";
import { RemoteInfo, Socket } from "dgram";

export function createDnsResponse(
  req: DnsPacket,
  resourceRecords: ResourceRecords,
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
      answerRRs: resourceRecords.answerRRs.length,
      authorityRRs: resourceRecords.authorityRRs.length,
      additionalRRs: resourceRecords.additionalRRs.length,
    },
    questions: req.questions,
    answerRRs: resourceRecords.answerRRs,
    authorityRRs: resourceRecords.authorityRRs,
    additionalRRs: resourceRecords.additionalRRs,
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
