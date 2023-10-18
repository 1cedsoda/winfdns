import { encodeName } from "./name";
import { describe, it } from "node:test";
import chai, { expect } from "chai";
import chaiBytes from "chai-bytes";
chai.use(chaiBytes);

describe("encodeName", () => {
  it("should encode example.com", () => {
    const name = "example.com";
    const buffer = Buffer.alloc(64);
    const expected = Buffer.from([
      7, // length of "example"
      101,
      120,
      97,
      109,
      112,
      108,
      101, // "example"
      3, // length of "com"
      99,
      111,
      109, // "com"
      0, // end of name
    ]);
    const result = encodeName(name, buffer, 0);
    expect(buffer.subarray(0, expected.length)).to.equalBytes(expected);
  });

  it("should encode www.google.com", () => {
    const name = "www.example.com";
    const buffer = Buffer.alloc(64);
    const expected = Buffer.from([
      3, // length of "www"
      119,
      119,
      119, // "www"
      7, // length of "example"
      101,
      120,
      97,
      109,
      112,
      108,
      101, // "example"
      3, // length of "com"
      99,
      111,
      109, // "com"
      0, // end of name
    ]);
    const result = encodeName(name, buffer, 0);
    expect(buffer.subarray(0, expected.length)).to.equalBytes(expected);
  });
});
