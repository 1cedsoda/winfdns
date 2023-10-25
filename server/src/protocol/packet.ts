import { DnsHeader, decodeHeader, encodeHeader } from "./header";
import { UsedNames } from "./name";
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
  const usedNames: UsedNames = {};
  let offset = 0;
  offset = encodeHeader(res.header, buffer, offset);
  if (res.header.questions > 0) {
    offset = encodeQuestions(res.questions, buffer, offset, usedNames);
  }
  if (res.header.answerRRs > 0) {
    offset = encodeResourceRecords(res.answerRRs, buffer, offset, usedNames);
  }
  if (res.header.authorityRRs > 0) {
    offset = encodeResourceRecords(res.authorityRRs, buffer, offset, usedNames);
  }
  if (res.header.additionalRRs > 0) {
    offset = encodeResourceRecords(
      res.additionalRRs,
      buffer,
      offset,
      usedNames
    );
  }

  // crop the buffer to the actual size
  const result = Buffer.alloc(offset);
  buffer.copy(result, 0, 0, offset);
  return result;
}

export function decodePacket(buffer: Buffer): DnsPacket {
  const header = decodeHeader(buffer);
  let offsetQuestions = 12;
  const [questions, offsetAnswerRRs] = decodeQuestions(
    buffer,
    header.questions,
    offsetQuestions
  );
  const [answerRRs, offsetAuthorityRRs] = decodeResourceRecords(
    buffer,
    header.answerRRs,
    offsetAnswerRRs
  );
  const [authorityRRs, offsetAdditionalRRs] = decodeResourceRecords(
    buffer,
    header.authorityRRs,
    offsetAuthorityRRs
  );
  const [additionalRRs] = decodeResourceRecords(
    buffer,
    header.additionalRRs,
    offsetAdditionalRRs
  );

  return { header, questions, answerRRs, authorityRRs, additionalRRs };
}
