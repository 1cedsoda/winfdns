# WinfDNS - Wi funktioniert DNS?
Von Momme Ketelse, Tom Hasen & Philipp Schemchel

# Inhaltsverzeichnis
1. Was ist DNS
2. DNS Hirarchie

# 01 Was ist DNS?
- Namensaufloesung
- Dezentrale Datenbank

# DNS Hirarchie
- Eine Domain setzt sich aus 63 Zeichen getrennt von einem `.` zusammen
- Hirarchie von rechts nach links

# Die Dezentrale Datenbank
- Alle Infos ueber eine Domain in einer Zone
- Eine Zone kann Infos ueber ein oder mehrere (sub) Domains enthalten
- Ein DNS Server kann auf einen anderen DNS Server verweisen
- Eine DNS Server kann als Secondary/Slave fungieren und stellt eine Cache dar, quasi eine Kopie eines Primary/Master DNS Servers

# DNS Resolution
- Resolver = DNS Client
- Resolver fragt einen DNS Server nach einer Domain -> bekommt entweder eine Antwort oder einen Verweis auf einen anderen DNS Server
- DNS resulution kann rekursiv oder iterativ sein

Iterativ ist einfach, rekursiv ist kompliziert (Nameserver muss smart sein)

## Iterative DNS Resolution
Der Resolver fragt einen DNS Server nach einer Domain und bekommt entweder eine Antwort oder einen Verweis auf einen anderen DNS Server

Beispiel: `gitlab.winf.dhsh` iterativ aufloesen
1. Resolver fragt den lokalen DNS Server nach `gitlab.winf.dhsh`
   Lokaler Server: `gitlab.winf.dhsh` ist eine Top Level Domain, frag mal bei `dhsh` nach
2. Resolver fragt den DNS Server von `dhsh` nach `gitlab.winf.dhsh`
   DNS Server von `dhsh` antwortet mit `gitlab.winf.dhsh` ist eine Subdomain von `winf.dhsh`, frag mal bei `winf.dhsh` nach
3. Resolver fragt den DNS Server von `winf.dhsh` nach `gitlab.winf.dhsh`
   DNS Server hat eine Zone fuer `winf.dhsh` in der auch `gitlab.winf.dhsh` enthalten ist und antwortet mit den angeforderten Infos

## Rekursive DNS Resolution
Der Resolver fragt einen DNS Server nach einer Domain und sagt, dass er eine definitive Antwort haben moechte (rekursiv)

Dies kann eine Antwort oder ein Fehler sein

### Rekusions Algorithmus
Falls der DNS Server die Domain nicht kennt muss er einen anderen DNS Server finden den er fragen kann.

Beispiel: `gitlab.winf.dhsh` rekursiv aufloesen
1. Resolver fragt den lokalen DNS Server nach `gitlab.winf.dhsh`
   Lokaler Server: Ich kenne `gitlab.winf.dhsh` nicht, kenne ich den Server von `gitlab.winf.dhsh`?
2. Lokaler Server kennt den DNS Server von `gitlab.winf.dhsh` nicht, kennt er den Server von `winf.dhsh`?
3. Lokaler Server kennt den DNS Server von `winf.dhsh` nicht, kennt er den Server von `dhsh`?
4. Lokaler Server kennt den DNS Server von `dhsh` und fragt diesen **iterativ** nach `gitlab.winf.dhsh`

# RTT - Round Trip Time
- Zeit die ein DNS Server braucht um eine Anfrage zu beantworten
- Je weiter weg der DNS Server ist, desto laenger dauert es

- BIND waelt seinen DNS Server nach der niedrigsten RTT aus
- Jeder Server startet mit einer zufaeligen niedrigen RTT und wird dann mit der Zeit angepasst
- Die initiale RTT ist zuefaellig um eine gleichmaessige Verteilung zu ermoeglichen

# Reverse DNS
- Reverse DNS ist optional
- Um eine IP Adresse zu einer Domain aufzuloesen wird die IP wie eine Domain gehandhabt.
- Reverse DNS findet unter der Domain `in-addr.arpa` statt
- `192.168.0.1` -> `1.0.168.192.in-addr.arpa`

# DNS Cacheing
- normales DNS Cacheing
- negative Cacheing

## TTL
- Jeder gecachte Eintrag hat eine TTL (Time To Live)
- Die TTL wird von der Zone festgelegt

## TODO weiter themen
- Parenting
- DNSSEC
- Sichtbarkeit
- DNS Notify
- round robin lastverteilung