import { DnsQuestion, DnsResponse } from "./protocol";
import { DnsRequest } from "./protocol/request";
import { createDnsResponse } from "./response";
import { ResourceRecord, zones } from "./zone";

export function handle(req: DnsRequest): DnsResponse {
  const { questions } = req;
  try {
    const answers = questions.flatMap(handleQuestion);
    return createDnsResponse(req, answers, "no error");
  } catch (e) {
    console.error(e);
    if (e instanceof RecordNotFound) {
      return createDnsResponse(req, [], "name error");
    } else {
      return createDnsResponse(req, [], "server failure");
    }
  }
}

export function handleQuestion(question: DnsQuestion): ResourceRecord[] {
  const records = [];
  for (const zone of zones) {
    for (const record of zone.records) {
      if (
        record.name === question.name &&
        record.type === question.type &&
        record.class === question.class
      ) {
        records.push(record);
      }
    }
  }
  if (records.length > 0) {
    return records;
  }
  throw new RecordNotFound();
}

class RecordNotFound extends Error {
  constructor() {
    super("Record not found");
  }
}
