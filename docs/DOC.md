# Das DNS Protokoll

Eine Projektarbeit fuer das Modul IT-Infrastruktur 5. Semester WINF121 an der Dualen Hochschule Schleswig-Holstein

- Momme Ketelsen
- Tom Hansen
- Philipp Schmechel

# Inhaltsverzeichnis

1. [Einleitung](#1-einleitung)

# 1. Einleitung

# 2. Grundlagen

## Query Arten

- Standard Query
- Inverse Query
- Server Status Request
- Notify
- Update

# 3. DNS Protokoll

## UDP oder TCP

Es gibt zwei Hauptübertragungsprotokolle, die für den DNS-Datenverkehr verwendet werden: UDP (User Datagram Protocol) und TCP (Transmission Control Protocol).

UDP wird standardmäßig auf Port 53 für den DNS-Verkehr verwendet. Dieses Protokoll eignet sich gut für die meisten DNS-Anfragen, da es aufgrund seiner Effizienz und Geschwindigkeit ideal ist, um schnelle Antworten auf Abfragen bereitzustellen.

Jedoch gibt es eine wichtige Ausnahme. Wenn die DNS-Antwort größer ist als 512 Bytes, was normalerweise bei umfangreichen Antworten oder bei der Verwendung von DNSSEC (DNS Security Extensions) der Fall ist, wird TCP anstelle von UDP verwendet. Die Größe der Antwort ist aufgrund der Begrenzung der maximalen Größe von UDP-Paketen auf 512 Bytes entscheidend. In solchen Fällen wechselt das DNS-System automatisch auf das zuverlässigere TCP-Protokoll und verwendet immer noch Port 53, um die Kommunikation zu ermöglichen. Dies gewährleistet, dass auch umfangreiche oder sicherheitsrelevante DNS-Antworten zuverlässig übertragen werden können.

## DNS Paket

- Header
- Question
- Answer
- Authority
- Additional

### Header

- ID
- QR
- Opcode
- AA
- TC
- RD
- RA
- Z
- RCODE
- QDCOUNT
- ANCOUNT
- NSCOUNT
- ARCOUNT
Die Transaktion ID wird vom Client gesetzt und vom Server zurückgegeben. So kann der Client die Antwort dem Request zuordnen.
Die Transaktion ID ist 16 Bit lang.

Jedes DNS Paket hat einen Header. Der Header ist 12 Bytes lang.

#### QR

Das erste Flag-Bit ist das QR-Bit. Es gibt an ob es sich um eine Anfrage oder eine Antwort handelt.


| Bedeutung | Wert | Bits |
| --------- | ---- | ---- |
| Anfrage   | 0    | 0    |
| Antwort   | 1    | 1    |

#### Opcode

Die Opcode-Flag ist 4 Bit lang. Sie gibt an um was für eine Anfrage es sich handelt. Es gibt 5 verschiedene Opcodes.


| Bedeutung             | Wert | Bits |
| --------------------- | ---- | ---- |
| Standard Query        | 0    | 0000 |
| Inverse Query         | 1    | 0001 |
| Server Status Request | 2    | 0010 |
| Reserverd             | 3    | 0011 |
| Notify                | 4    | 0100 |
| Update                | 5    | 0101 |

#### AA

Die AA-Flag gibt an ob der Server autoritativ ist. Das heißt ob der Server die Antwort aus einer eigenen Zone hat. Die Flag ist 1 Bit lang.


| Bedeutung                      | Wert | Bits |
| ------------------------------ | ---- | ---- |
| Antowort aus eigener Zone      | 1    | 1    |
| Antwort nicht aus eigener Zone | 0    | 0    |

#### TC

Die TC-Flag gibt an ob die Nachricht abgeschnitten wurde. Das heißt ob die Nachricht größer als 512 Bytes ist. Die Flag ist 1 Bit lang.


| Bedeutung                     | Wert | Bits |
| ----------------------------- | ---- | ---- |
| Nachricht abgeschnitten       | 1    | 1    |
| Nachricht nicht abgeschnitten | 0    | 0    |

#### RD

Die RD-Flag gibt an ob die Andfrage rekursiv beantwortet werden soll. Die Flag ist 1 Bit lang.


| Bedeutung         | Wert | Bits |
| ----------------- | ---- | ---- |
| Rekursive Anfrage | 1    | 1    |
| Iterative Anfrage | 0    | 0    |

#### RA

Die RA-Flag gibt an ob der Server rekursive Anfragen unterstützt. Die Flag ist 1 Bit lang.

| Bedeutung                           | Wert | Bits |
| ----------------------------------- | ---- | ---- |
| Rekursive Anfrage untersuetzt       | 1    | 1    |
| Rekusive Anfrage nicht unterstuetzt | 0    | 0    |

#### Z

Die Z-Flag ist 3 Bit lang und reserviert für zukünftige Verwendung.

#### RCODE

Die RCODE-Flag gibt an ob ein Fehler aufgetreten ist. Die Flag ist 4 Bit lang.

| Bedeutung                            | Wert | Bits |
| ------------------------------------ | ---- | ---- |
| Kein Fehler                          | 0    | 0000 |
| Format Fehler                        | 1    | 0001 |
| Server Fehler                        | 2    | 0010 |
| Name Error                           | 3    | 0011 |
| Nicht implementiert                  | 4    | 0100 |
| Refused                              | 5    | 0101 |
| Name existiert bereits               | 6    | 0110 |
| RR Set existiert bereits             | 7    | 0111 |
| RR Set existiert nicht               | 8    | 1000 |
| Nicht autoritativ                    | 9    | 1001 |
| Name nicht in Zone                   | 10   | 1010 |
| Nicht authentifiziert                | 11   | 1011 |
| Nicht authentifiziert - keine Daten  | 12   | 1100 |
| Nicht authentifiziert - keine Sign.  | 13   | 1101 |
| Nicht authentifiziert - Sign. falsch | 14   | 1110 |
| Nicht authentifiziert - Sign. fehlt  | 15   | 1111 |

### Counters

Nach den Flags folgen die Zähler.
Die Zähler geben an wie viele Quesions oder Resource Records in den jeweiligen Abschnitten sind.

Es gibt die Abschnitte in der Reihenfolge Question, AnswerRRs, AuthorityRss und AdditionalRRs.
Fuer jeden Abschnitt gibt es einen Counter.

- QDCOUNT
- ANCOUNT
- NSCOUNT
- ARCOUNT

Jeder Zähler ist 16 Bit lang und enthält die Anzahl der Question / Resource Records in dem jeweiligen Abschnitt.

Wenn der Zähler 0 ist, dann gibt es keine Question / Resource Records in dem jeweiligen Abschnitt.

### Question

- QNAME
- QTYPE
- QCLASS

Die Anzahl der Question wird durch den QDCOUNT Zähler im Header angegeben.

#### Domain Encoding
Das Domain Encoding wird nicht nur bei der Question verwendet sondern auch an anderen Stellen in Resource Records.

Eine Domain kann eine variable Länge haben. Deshalb muss die Länge der Domain gespichert werden.

Eine Domain wird durch eine Sequenz von Labels dargestellt. Jedes Label entspricht einem Teil der Domain, der durch einen Punkt getrennt ist. `www.google.com` besteht aus den Labels `www`, `google` und `com`. 

Die länge der Domain nicht gesamt angegeben sondern die Länge jedes Labels einzeln.
Jedes Label ist 1 bis 63 Zeichen lang. Somit kann die Länge eines Labels durch ein Byte gespeichert werden.

Um ein Label zu kodieren wird zuerst in einem Byte die Länge des Labels gespeichert. Danach folgen die Zeichen des Labels in ASCII Kodierung.

Nach dem letzten Label folgt ein Null Byte.

Beispiel: `google.com` wird zu `6google3com0`
| Hex | Bedeutung                 |
| --- | ------------------------- |
| 06  | Länge des Labels `google` |
| 67  | `g`                       |
| 6f  | `o`                       |
| 6f  | `o`                       |
| 67  | `g`                       |
| 6c  | `l`                       |
| 65  | `e`                       |
| 03  | Länge des Labels `com`    |
| 63  | `c`                       |
| 6f  | `o`                       |
| 6d  | `m`                       |
| 00  | Null Byte                 |

**Maximale Länge eines Labels**
Im RFC 1034 

### Answer Resource Recods



- NAME
- TYPE
- CLASS
- TTL
- RDLENGTH
- RDATA
### Authority Resource Records

- NAME
- TYPE
- CLASS
- TTL
- RDLENGTH
- RDATA
### Additional Resource Records
