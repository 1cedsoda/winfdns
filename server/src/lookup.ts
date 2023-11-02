import { filterRRs, findRR } from "./handler";
import {
  DnsPacket,
  DnsQuestion,
  ResourceRecord,
  decodePacket,
  encodePacket,
} from "./protocol";
import dgram from "dgram";

export async function lookupQuestionRecursive(
  question: DnsQuestion
): Promise<ResourceRecord[]> {
  const questionPacket = createLookupPacket(question);
  const rootDns = process.env.ROOT_DNS;
  let nsIp = rootDns;
  while (true) {
    // ask dns sever
    const res = await sendDnsPacket(questionPacket, 53, nsIp);
    const answer = filterRRs(
      res.answerRRs,
      question.name,
      question.type,
      question.class
    );
    if (answer.length > 0) {
      return answer;
    }

    // find name servers
    const nsDomains = filterRRs(res.authorityRRs, question.name, "NS", "IN");
    if (nsDomains.length == 0)
      throw new Error("No name servers to continue lookup");
    const selectedNsDomain = nsDomains[0].name; // could also select random

    // use glue records if available
    // otherwise lookup A record for the name server
    nsIp =
      findRR(res.additionalRRs, selectedNsDomain, "A", question.class)?.data ||
      (await lookupARecursive(selectedNsDomain));
  }
}

export async function lookupARecursive(domain: string): Promise<string> {
  const question: DnsQuestion = {
    name: domain,
    type: "A",
    class: "IN",
  };
  const res = await lookupQuestionRecursive(question);
  const answer = findRR(res, domain, "A", "IN");
  return answer.name;
}

export function createLookupPacket(question: DnsQuestion): DnsPacket {
  // encode packet
  const packet: DnsPacket = {
    header: {
      transactionId: randomTransactionId(),
      flags: {
        isResponse: false,
        operation: "standard query",
        authoritativeAnswer: false,
        truncated: false,
        recursionDesired: false,
        recursionAvailable: false,
        z: 0,
        responseCode: "no error",
      },
      questions: 1,
      answerRRs: 0,
      authorityRRs: 0,
      additionalRRs: 0,
    },
    questions: [question],
    answerRRs: [],
    authorityRRs: [],
    additionalRRs: [],
  };

  return packet;
}

export async function sendDnsPacket(
  packet: DnsPacket,
  port: number,
  ip: string
): Promise<DnsPacket> {
  console.log(
    `Asking ${ip}:${port} for ${packet.questions[0].name} (${packet.questions[0].type})`
  );
  // encode packet
  const buffer = encodePacket(packet);

  // send packet
  const res = await sendUdpPacket(buffer, 53, ip);

  // decode packet
  const decoded = decodePacket(res);
  console.log("Lookup result:", {
    answerRRs: decoded.answerRRs,
    authorityRRs: decoded.authorityRRs,
    additionalRRs: decoded.additionalRRs,
  });
  return decoded;
}

async function sendUdpPacket(
  buffer: Buffer,
  port: number,
  ip: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket("udp4");

    client.on("error", (err) => {
      console.error(err.stack);
      client.close();
      reject(err);
    });

    client.on("message", (msg, rinfo) => {
      client.close();
      resolve(msg);
    });

    client.on("listening", () => {
      const address = client.address();
    });

    client.send(buffer, port, ip, (err) => {
      if (err) {
        client.close();
        reject(err);
      }
    });
  });
}

function randomTransactionId() {
  return Math.floor(Math.random() * 65535);
}
