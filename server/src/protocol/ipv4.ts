export function encodeIpv4(ip: string, buffer: Buffer, offset: number): number {
  // IP address
  const parts = ip.split(".");
  for (const part of parts) {
    const number = parseInt(part, 10);
    buffer.writeUInt8(number, offset);
    offset += 1;
  }
  return offset;
}

export function decodeIpv4(buffer: Buffer, offset: number): string {
  const length = buffer.readUInt16BE(offset);
  offset += 2;
  const parts: string[] = [];
  for (let i = 0; i < length; i++) {
    parts.push(buffer.readUInt8(offset).toString());
    offset += 1;
  }
  return parts.join(".");
}
