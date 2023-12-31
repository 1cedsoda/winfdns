import { lookupQuestionRecursive } from "./lookup";
import {
  DnsPacket,
  DnsQuestion,
  ResourceRecord,
  ResourceRecords,
  ResourceType,
  emptyResourceRecords,
  mergeResourceRecods,
} from "./protocol";
import { createDnsResponse, recursionAvailable } from "./response";
import { Zones } from "./zone";

export async function handle(req: DnsPacket): Promise<DnsPacket> {
  const { questions } = req;
  try {
    const answers = (
      await Promise.all(
        questions.map(async (question) => {
          return await handleQuestion(question);
        })
      )
    ).reduce((prev, curr) => mergeResourceRecods(prev, curr));
    return createDnsResponse(req, answers, "no error");
  } catch (e) {
    console.error(e);
    if (e instanceof RecordNotFound) {
      return createDnsResponse(req, emptyResourceRecords, "name error");
    } else {
      return createDnsResponse(req, emptyResourceRecords, "server failure");
    }
  }
}

export async function handleQuestion(
  question: DnsQuestion
): Promise<ResourceRecords> {
  // TODO: try cache
  // find answers
  const answerRRs = recursionAvailable
    ? findAnswers(question)
    : await lookupQuestionRecursive(question);
  // if no answers, find authorities
  const authorityRRs = answerRRs.length == 0 ? findAuthorities(question) : [];
  // try to add A records for NS records
  const additionalRRs = findGlueRecords([...answerRRs, ...authorityRRs]);
  return {
    answerRRs,
    authorityRRs,
    additionalRRs,
  };
}

export function findAnswers(question: DnsQuestion): ResourceRecord[] {
  const answerRRs = [];
  for (const zone of Zones.getZones()) {
    for (const record of zone.records) {
      if (
        record.name === question.name &&
        record.type === question.type &&
        record.class === question.class
      ) {
        answerRRs.push(record);
      }
    }
  }
  return answerRRs;
}

function findAuthorities(question: DnsQuestion): ResourceRecord[] {
  let domain = `${question.name}`;
  while (true) {
    const authorityRRs = Zones.filter((record) => {
      return (
        record.name === domain &&
        record.type === "NS" &&
        record.class === question.class
      );
    });
    if (authorityRRs.length > 0) {
      return authorityRRs;
    }
    if (domain === "") {
      return [];
    }
    // pop the first label
    const labels = domain.split(".");
    labels.shift();
    domain = labels.join(".");
  }
}

function findGlueRecords(authorityRRs: ResourceRecord[]): ResourceRecord[] {
  // filter A records
  const uniqueAuthorities = [
    ...new Set(
      authorityRRs
        .filter((record) => record.type === "NS")
        .map((record) => record.data)
    ),
  ];
  const additionalRRs = Zones.filter((rr) => {
    return (
      rr.type === "A" &&
      rr.class === "IN" &&
      uniqueAuthorities.includes(rr.name)
    );
  });
  return additionalRRs;
}

class RecordNotFound extends Error {
  constructor() {
    super("Record not found");
  }
}

export function filterRRs(
  resourceRecords: ResourceRecord[],
  name?: string | undefined,
  type?: ResourceType | undefined,
  class_?: string | undefined
): ResourceRecord[] {
  return resourceRecords.filter((rr) => {
    return (
      (name === undefined || rr.name === name) &&
      (type === undefined || rr.type === type) &&
      (class_ === undefined || rr.class === class_)
    );
  });
}

export function findRR(
  resourceRecords: ResourceRecord[],
  name?: string | undefined,
  type?: ResourceType | undefined,
  class_?: string | undefined
): ResourceRecord | undefined {
  const res = filterRRs(resourceRecords, name, type, class_);
  if (res.length == 0) {
    return undefined;
  }
  return res[0];
}
