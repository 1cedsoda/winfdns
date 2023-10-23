FROM node:18

RUN npm i -g typescript nodemon ts-node

WORKDIR /app
COPY server/ .

RUN npm i
RUN npm run build

EXPOSE 53
CMD ["npm", "run", "dev"]