export function decodeName(buffer: Buffer, offset: number): string {
  let name = "";
  let length = buffer.readUInt8(offset);
  while (length > 0) {
    if (name.length > 0) {
      name += ".";
    }
    name += buffer.toString("utf8", offset + 1, offset + 1 + length);
    offset += 1 + length;
    length = buffer.readUInt8(offset);
  }
  return name;
}

export function encodeName(
  name: string,
  buffer: Buffer,
  offset: number
): number {
  const labels = name.split(".");
  for (const label of labels) {
    const len = buffer.write(label, offset + 1);
    buffer.writeUInt8(len, offset);
    offset += len + 1;
  }
  buffer.writeUInt8(0, offset);
  offset += 1;
  return offset;
}

export function encodedNameBytes(name: string): number {
  let bytes = 1; // 00 byte
  const labels = name.split(".");
  for (const label of labels) {
    bytes += label.length + 1; // label length byte + ascii bytes
  }
  return bytes;
}
