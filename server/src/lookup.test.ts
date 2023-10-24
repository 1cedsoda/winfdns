import { describe, it } from "node:test";
import chai, { expect } from "chai";
import { createLookupPacket, sendDnsPacket } from "./lookup";
import { DnsQuestion } from "./protocol";

describe("lookupQuestion", () => {
  it("should answer a question", async () => {
    const question: DnsQuestion = {
      name: "example.com",
      type: "A",
      class: "IN",
    };
    const req = createLookupPacket(question);
    const res = await sendDnsPacket(req, 53, "1.1.1.1");
    expect(res.answerRRs.length).to.equal(1);
    expect(res.answerRRs[0].name).to.equal(question.name);
    expect(res.answerRRs[0].type).to.equal(question.type);
    expect(res.answerRRs[0].class).to.equal(question.class);
  });
});
