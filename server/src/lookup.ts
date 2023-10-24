import { DnsPacket, DnsQuestion, decodePacket, encodePacket } from "./protocol";
import dgram from "dgram";

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
