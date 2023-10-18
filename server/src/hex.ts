// derived from https://gist.github.com/NielsLeenheer/4dc1a266717b7379333365e9806c3044
export const debugHex = (data) =>
  Array.from(
    Object(data).buffer instanceof ArrayBuffer
      ? new Uint8Array(data.buffer)
      : typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8ClampedArray(data)
  ).reduce(
    (acc, v, i, arr) =>
      acc +
      (i % 16 === 0 ? i.toString(16).padStart(6, "0") + "  " : " ") +
      v.toString(16).padStart(2, "0") +
      (i === arr.length - 1 || i % 16 === 15
        ? " ".repeat((15 - (i % 16)) * 3) +
          Array.from(arr)
            .slice(i - (i % 16), i - (i % 16) + 16)
            .reduce(
              (result, value) =>
                result +
                (value > 31 && value < 127 ? String.fromCharCode(value) : "."),
              "  "
            ) +
          "\n"
        : ""),
    ""
  );
