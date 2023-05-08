FROM node:19

ENV NODE_ENV development

WORKDIR /turvis

COPY src src
COPY package.json package.json

RUN npm i -g npm@latest

ENTRYPOINT ["npm", "start"]

FROM node:19 AS base
RUN mkdir /turvis
RUN chown node:node /turvis
USER node
WORKDIR /turvis
COPY --chown=node:node package.json ./

# Install production dependencies
FROM base AS dependencies
COPY --chown=node:node .npmrc package-lock.json ./
RUN npm ci --production

# Install development dependencies and build
FROM dependencies AS build
RUN npm ci
COPY --chown=node:node src ./src
COPY --chown=node:node tsconfig.build.json tsconfig.json ./
RUN npm run build

# Copy production dependencies, build artifacts and runtime configuration and run
FROM base
COPY --chown=node:node --from=dependencies /turvis/node_modules ./node_modules
COPY --chown=node:node --from=build /turvis/dist ./dist
COPY --chown=node:node config/production.env ./config/
ENV NODE_ENV=production
CMD npm run start:prod
