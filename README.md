# Turvis

## Description
Turvis module is designed to accept incomming requests from ruuter for further analysis for security threats, bad actors etc.
The functionality is to map all the requests paths to generic endpoint in Turvis and extract the payload: headers, request parameters, and message body.

## Runnig Turvis service
1. Run turvis app locally, without docker:
   ```
   npm install
   npm start
   ```
2. Run turvis app with docker:
   ```
   make build
   docker-compose up -d
   ```

## Changes
- Project setup with: 
  - node.js using typescript
  - prettier formatting
  - Lint static checks
  - fastify node.js server
  - Dockerfile for building the image
  - docker-compose for running the service
- two endpoints, `GET turvis:8060/ruuter-incoming`and `POST turvis:8060/ruuter-incoming`, for accepting calls from ruuter.