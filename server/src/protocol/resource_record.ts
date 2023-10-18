// A = IPv4 address
// NS = authoritative name server
// CNAME = canonical name for an alias
// SOA = marks the start of a zone of authority
// PTR = domain name pointer
// MX = mail exchange
// TXT = text strings
export type ResourceType = "A" | "NS" | "CNAME" | "SOA" | "PTR" | "MX" | "TXT";

// IN = internet
// CS = CSNET (obsolete)
// CH = CHAOS (obsolete)
// HS = Hesiod (obsolete)
export type ResourceClass = "IN" | "CS" | "CH" | "HS";

export function decodeResourceType(type: number): ResourceType {
  switch (type) {
    case 1:
      return "A";
    case 2:
      return "NS";
    case 5:
      return "CNAME";
    case 6:
      return "SOA";
    case 12:
      return "PTR";
    case 15:
      return "MX";
    case 16:
      return "TXT";
    default:
      throw new Error(`Unknown question type ${type}`);
  }
}

export function decodeResourceClass(klass: number): ResourceClass {
  switch (klass) {
    case 1:
      return "IN";
    case 2:
      return "CS";
    case 3:
      return "CH";
    case 4:
      return "HS";
    default:
      throw new Error(`Unknown question class ${klass}`);
  }
}

export function encodeResourceType(type: ResourceType): number {
  switch (type) {
    case "A":
      return 1;
    case "NS":
      return 2;
    case "CNAME":
      return 5;
    case "SOA":
      return 6;
    case "PTR":
      return 12;
    case "MX":
      return 15;
    case "TXT":
      return 16;
    default:
      throw new Error(`Unknown question type ${type}`);
  }
}

export function encodeResourceClass(_class: ResourceClass): number {
  switch (_class) {
    case "IN":
      return 1;
    case "CS":
      return 2;
    case "CH":
      return 3;
    case "HS":
      return 4;
    default:
      throw new Error(`Unknown question class ${_class}`);
  }
}
