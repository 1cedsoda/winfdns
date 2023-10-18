// derived from https://gist.github.com/NielsLeenheer/4dc1a266717b7379333365e9806c3044
export const debugHex = (data) =>
  Array.from(
    Object(data).buffer instanceof ArrayBuffer
      ? new Uint8Array(data.buffer)
      : typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8ClampedArray(data)
  ).reduce(
    (accumulator, currentValue, currentIndex, array) =>
      accumulator +
      (currentIndex % 16 === 0
        ? currentIndex.toString(16).padStart(6, "0") + "  "
        : " ") +
      currentValue.toString(16).padStart(2, "0") +
      (currentIndex === array.length - 1 || currentIndex % 16 === 15
        ? " ".repeat((15 - (currentIndex % 16)) * 3) +
          Array.from(array)
            .slice(
              currentIndex - (currentIndex % 16),
              currentIndex - (currentIndex % 16) + 16
            )
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
