export type UsedNames = {
  [key: string]: number;
};

export function decodeName(buffer: Buffer, offset: number): [string, number] {
  let labels: string[] = [];
  const offsets = new Set(); // Keep track of offsets to detect loops

  while (true) {
    if (offset >= buffer.length) {
      throw new Error("Invalid compression pointer");
    }

    const length = buffer.readUInt8(offset);

    // end of name
    if (length === 0) {
      offset++;
      break;
    }

    // compression flag
    if ((length & 0xc0) === 0xc0) {
      // Extract the compression pointer
      const compressionPointer = buffer.readUInt16BE(offset) & 0x3fff;

      if (offsets.has(compressionPointer)) {
        throw new Error("Compression loop detected");
      }

      // Recursively decode the referenced name
      const [referencedName, _] = decodeName(buffer, compressionPointer);

      // Append the referenced name to the current name
      labels.push(referencedName);
      offset += 2;
      break;
    }

    // decode label
    offset++;
    const label = buffer.toString("ascii", offset, offset + length);
    labels.push(label);
    offset += length;
    offsets.add(offset);
  }

  const name = labels.join(".");

  return [name, offset];
}

export function encodeName(
  name: string,
  buffer: Buffer,
  offset: number,
  usedNames: UsedNames
): number {
  const labels = name.split(".");

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const remainingName = labels.slice(i).join(".");

    // check if we can use a compression pointer
    if (remainingName in usedNames) {
      console.log("found", remainingName, "in pointer cache");
      const compressionPointer = usedNames[remainingName];
      buffer.writeUInt16BE(0xc000 | compressionPointer, offset);
      offset += 2;
      // return now, no need to write the rest of the name
      return offset;
    } else {
      // add remainingName to usedNames
      usedNames[remainingName] = offset;
    }

    // write label length
    buffer.writeUInt8(label.length, offset);
    offset += 1;

    // write label
    buffer.write(label, offset);
    offset += label.length;
  }
  // write end of name
  buffer.writeUInt8(0, offset);
  offset += 1;
  return offset;
}
