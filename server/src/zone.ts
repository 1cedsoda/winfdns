import YAML from "yaml";
import { readFileSync, writeFileSync } from "fs";
import { ResourceClass, ResourceType } from "./protocol/resource_record";

export type Zone = {
  name: string;
  records: ResourceRecord[];
};

export type ResourceRecord = {
  name: string;
  type: ResourceType;
  class: ResourceClass;
  ttl: number;
  data: string;
};

export function readZoneYaml(path: string): Zone {
  const file = readFileSync(path, "utf8");
  const zone = YAML.parse(file);
  return zone as Zone;
}

export function writeZoneYaml(zone: Zone, path: string): void {
  const file = YAML.stringify(zone);
  writeFileSync(path, file);
}

export const zones: Zone[] = [
  {
    name: "domain example.com",
    records: [
      // A 1.2.3.4
      {
        type: "A",
        name: "example.com",
        class: "IN",
        ttl: 1,
        data: "1.2.3.4",
      },
      // TXT
      {
        type: "TXT",
        name: "example.com",
        class: "IN",
        ttl: 1,
        data: "Hello World",
      },
      // TXT
      {
        type: "TXT",
        name: "example.com",
        class: "IN",
        ttl: 1,
        data: "Hello World 2",
      },
    ],
  },
];
