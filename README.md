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

# Changes
## Feature/6, Feature/9
- Project setup with: 
  - node.js using typescript
  - prettier formatting
  - Lint static checks
  - fastify node.js server
  - Dockerfile for building the image
  - docker-compose for running the service
- two endpoints, `GET turvis:8060/ruuter-incoming`and `POST turvis:8060/ruuter-incoming`, for accepting calls from ruuter.

## feature/7
- turvis and ruuter setup with one composer file. to run it:  


```
cd /integration
make start
```

   it will build ruuter from github latest main branch, copies the modified `application.yml`file to container and maps to `integration/configs/DSL` directory.
- simple endpoint is configured for ruuter to forward requests to `turvis`
  
  sample query: `curl -X GET localhost:8500/test-call`