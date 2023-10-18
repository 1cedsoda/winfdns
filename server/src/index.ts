// dgram server ffor dns server

import dgram from "dgram";
import { debugHex } from "./console.hex";
import { parseDnsRequest } from "./request";

const server = dgram.createSocket("udp4");

server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  // print message in hex
  console.log(debugHex(msg));
  console.log(parseDnsRequest(msg));
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(53);
