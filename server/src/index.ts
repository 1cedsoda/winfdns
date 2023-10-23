// dgram server ffor dns server

import dgram from "dgram";
import { debugHex } from "./hex";
import { createDnsResponse, sendResponse } from "./response";
import { handle } from "./handler";
import { decodePacket, encodePacket } from "./protocol";
import { Zones } from "./zone";

const server = dgram.createSocket("udp4");

server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  // debugging
  console.log(`===> Request from ${rinfo.address}:${rinfo.port}`);
  console.log(debugHex(msg));
  console.log(decodePacket(msg), "\n");

  // decoding
  let req;
  try {
    req = decodePacket(msg);
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
  console.log(debugHex(encodePacket(res)));
  console.log(res, "\n");

  // send
  sendResponse(res, rinfo, server);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(53);

// load zones
Zones.getInstance();
