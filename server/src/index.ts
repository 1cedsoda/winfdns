// dgram server ffor dns server

import dgram from "dgram";
import { debugHex } from "./hex";
import {
  createDnsResponse,
  recursionAvailable,
  sendResponse,
} from "./response";
import { handle } from "./handler";
import { decodePacket, emptyResourceRecords, encodePacket } from "./protocol";
import { Zones } from "./zone";

const server = dgram.createSocket("udp4");

server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", async (msg, rinfo) => {
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
      createDnsResponse(req, emptyResourceRecords, "format error"),
      rinfo,
      server
    );
  }

  // handling
  const res = await handle(req);
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

// debugging
console.log("ROOT_DNS:", process.env.ROOT_DNS);
console.log("RECURSION_AVAILABLE:", recursionAvailable);

// SIGTERM & SIGINT

const shutdown = () => {
  console.log("Shutting down...");
  server.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
