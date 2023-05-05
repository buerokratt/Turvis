FROM node:19

ENV NODE_ENV development

WORKDIR /turvis

COPY src src
COPY package.json package.json

RUN npm i -g npm@latest

ENTRYPOINT ["npm", "start"]
