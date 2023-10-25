import { UsedNames, decodeName, encodeName } from "./name";
import { describe, it } from "node:test";
import chai, { expect } from "chai";
import chaiBytes from "chai-bytes";
import { debugHex } from "../hex";
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
    const result = encodeName(name, buffer, 0, {});
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
    encodeName(name, buffer, 0, {});
    expect(buffer.subarray(0, expected.length)).to.equalBytes(expected);
  });

  it("should encode www.example.com and save pointers for compression", () => {
    const name = "example.com";
    const buffer = Buffer.alloc(64);
    const usedNames = {};
    encodeName(name, buffer, 0, usedNames);
    const expected = {
      "example.com": 0,
      com: 8,
    };
    expect(usedNames).to.deep.equal(expected);
  });

  it("should encode www.example.com and save pointers for compression", () => {
    const name = "example.com";
    const buffer = Buffer.alloc(64);
    const usedNames = {
      "example.com": 100,
    };
    encodeName(name, buffer, 0, usedNames);
    const expected = Buffer.from([0xc0, 100]);
    expect(buffer.subarray(0, expected.length)).to.equalBytes(expected);
  });
});

describe("decodeName", () => {
  it("should decode example.com", () => {
    const buffer = Buffer.from([
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
    const expected = "example.com";
    const [result, _] = decodeName(buffer, 0);
    expect(result).to.equal(expected);
  });

  it("should decode www.example.com", () => {
    const buffer = Buffer.from([
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
    const expected = "www.example.com";
    const [result, _] = decodeName(buffer, 0);
    expect(result).to.equal(expected);
  });

  it("should decode www.example.com with compression", () => {
    const buffer = Buffer.from([
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
      0xc0,
      0x00, // compression pointer to "example.com"
    ]);
    const expected = "www.example.com";
    const [result, _] = decodeName(buffer, 17);
    expect(result).to.equal(expected);
  });
});
