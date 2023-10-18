# WinfDNS

## Dev Setup
install `ts-node`, `nodemon`, `ts-mocha` and `typescript` globally
```bash
npm install -g ts-node nodemon ts-mocha typescript
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
Query TXT records for example.com
```bash
dig -t txt -p 53 @localhost  example.com
```
