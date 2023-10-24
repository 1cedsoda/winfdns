import YAML from "yaml";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { ResourceRecord } from "./protocol/resource_record";

export type Zone = {
  name: string;
  records: ResourceRecord[];
};

export function readZoneYamlDir(path: string): Zone[] {
  const zones: Zone[] = [];
  readdirSync(path).forEach((file) => {
    const _path = `${path}/${file}`;
    const zone = readZoneYaml(`${_path}`);
    zones.push(zone);
  });
  return zones;
}

export function readZoneYaml(path: string): Zone {
  const file = readFileSync(path, "utf8");
  const zone = YAML.parse(file);
  return zone as Zone;
}

export function writeZoneYaml(zone: Zone, path: string): void {
  const file = YAML.stringify(zone);
  writeFileSync(path, file);
}

export const ZONE_DIR = process.env.ZONE_DIR;
export const default_zones: Zone[] = [
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
  {
    name: "root DNS",
    records: [
      // NS
      {
        type: "NS",
        name: "com",
        class: "IN",
        ttl: 1,
        data: "ns1.com",
      },
      // A
      {
        type: "A",
        name: "ns1.com",
        class: "IN",
        ttl: 1,
        data: "1.2.3.4",
      },
    ],
  },
];

export class Zones {
  private static instance: Zones;
  private zones: Zone[] = [];

  private constructor() {
    if (ZONE_DIR) {
      console.log(`Reading zones from ${ZONE_DIR}`);
      this.zones = readZoneYamlDir(ZONE_DIR);
    } else {
      console.log(`Reading default zones`);
      this.zones = default_zones;
    }
    this.zones.forEach((zone) => {
      console.log(`=> Zone "${zone.name}"`);
      zone.records.forEach((record) => {
        console.log(
          `  ${record.name} ${record.type} ${record.class} ${record.data}`
        );
      });
    });
  }

  public static getInstance(): Zones {
    if (!Zones.instance) {
      Zones.instance = new Zones();
    }
    return Zones.instance;
  }

  public static getZones(): Zone[] {
    return Zones.getInstance().zones;
  }

  public static filter(
    callback: (record: ResourceRecord) => boolean
  ): ResourceRecord[] {
    const found: ResourceRecord[] = [];
    Zones.getZones().forEach((zone) => {
      for (const rr of zone.records) {
        if (callback(rr)) {
          found.push(rr);
        }
      }
    });
    return found;
  }
}
