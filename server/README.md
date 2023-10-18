# WinfDNS

## Dev Setup
install `ts-node` and `nodemon` globally
```bash
npm install -g ts-node nodemon
```
Then install dependencies
```bash
cd server
npm install
```
Run
```bash 
npm run dev
```
# Production Setup
Install dependencies
```bash
cd server
npm install
```
Build
```bash
npm run build
```
Run
```bash
npm run start
```

# How to query
Query `example.com`
```bash
dig @localhost -p 53 example.com
```
