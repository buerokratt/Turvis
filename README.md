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
- turvis and ruuter setup with one composer file. \
   ```
   cd integration
   make start
   ```
   By default it will build ruuter image from github main branch, copies the modified `application.yml` file to container and maps to `integration/configs/DSL` directory so that new queries can be modified outside of docker container itself.

   In addition, the docker build supports:

   - build the latest: \
   `docker build -t buerokratt/ruuter-test -f ruuter/Dockerfile.ruuter ./`
   -  build a specific branch: \
   `docker build --build-arg GIT_BRANCH=<branch_name> -t buerokratt/ruuter-test -f ruuter/Dockerfile.ruuter .`
   - build a specific commit: \
   `docker build --build-arg GIT_COMMIT=<commit_hash> -t buerokratt/ruuter-test -f ruuter/Dockerfile.ruuter  .`
   - To build a specific tag: \
   `docker build --build-arg GIT_TAG=<tag_name> -t buerokratt/ruuter-test -f ruuter/Dockerfile.ruuter  .`

   The same configuration is exposed to docker-compose via `.env` file

   for corner cases when there is a need to build from forked repo, one can be configured with `GIT_REPO_URL`

- simple endpoint is configured for ruuter to forward requests to `turvis` \
  sample query: `curl -X GET localhost:8500/test-call`