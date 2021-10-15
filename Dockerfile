FROM node:16.11.1-alpine

EXPOSE 3000

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /usr/src/app

COPY package.json package-lock.json .
RUN npm ci

COPY . .

CMD [ "npm", "start", "--silent" ]
