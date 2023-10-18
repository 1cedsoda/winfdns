// dgram server ffor dns server

import dgram from "dgram";
import { debugHex } from "./hex";
import { decodeDnsRequest, encodeDnsResponse } from "./protocol";
import { createDnsResponse, sendResponse } from "./response";
import { handle } from "./handler";
import { encode } from "punycode";

const server = dgram.createSocket("udp4");

server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  // debugging
  console.log(`===> Request from ${rinfo.address}:${rinfo.port}`);
  console.log(debugHex(msg));
  console.log(decodeDnsRequest(msg), "\n");

  // decoding
  let req;
  try {
    req = decodeDnsRequest(msg);
  } catch (e) {
    console.error(e);
    return sendResponse(
      createDnsResponse(req, [], "format error"),
      rinfo,
      server
    );
  }

  // handling
  const res = handle(req);
  console.log(`<=== Response to ${rinfo.address}:${rinfo.port}`);
  console.log(debugHex(encodeDnsResponse(res)));
  console.log(res, "\n");

  // send
  sendResponse(res, rinfo, server);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(53);
