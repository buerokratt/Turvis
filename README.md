# Turvis

## Description
Turvis module is designed to accept incomming requests from ruuter for further analysis for security threats, bad actors etc.
The functionality is to map all the requests paths to generic endpoint in Turvis and extract the payload: headers, request parameters, and message body.

## Runnig Turvis service
1. Run Turvis app locally, without docker:
   ```
   npm install
   npm start
   ```
2. Run Turvis app with docker:
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
- two endpoints, `GET turvis:8060/ruuter-incoming`and `POST turvis:8060/ruuter-incoming`, for accepting calls from Ruuter.

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

## Feature/8
- shell script to execute curl queries. Script expects following file structure for test directory
```
test
├── suite_1
│   ├── valid
│   │   ├── valid.curl
│   │   └── valid_2.curl
│   ├── invalid
│   │   └── invalid.curl
│   └── uncertain
│   │   └── uncertain.curl
│   ├── Child_Directory2
│   └── Child_Directory3
│       ├── Subdirectory3
│       └── Subdirectory4
├── suite_2
│   ├── valid
│   │   ├── test_2_valid.curl
│   │   └── test_2_valid_2.curl
│   ├── invalid
│   │   └── tet_2-invalid.curl
│   └── uncertain
│   │   └── test_1_uncertain.curl
└── .endpoint
```
1. In each folder - valid, invalid, uncertain - are curl queries.
2.  When the scripts are executed, the first step is to move the script into `processed` folder, including the timestamp. e.g. `valid/call_endpoint.curl`will be moved to `valid/processed/call_endpoint.<timestamp>.curl`. 
3.  Then, script is checked if it contains placeholder `{{endpoint}}`. if it does, the placeholder will be replaced with the value from `.endpoint` file and then executed
4.  Based on the HTTP return value, e.g. `200`, a new directory is created with name corresponding to HTTP return value, in this case `valid/200` and the file is also stored there, including timestamp.

- starting the pipeline:
  ```
  cd pipeline && make start 
  ```
  -  it will start container that executes the scripts every 60 seconds (CRON)
  -  it mounts `<root>/pipeline/test` directory to container. files can be placed in this folder for testing, setup based on guidelines outlined in file structure. Quickest way to test is to copy test_v1 directory from test.example to test and wait for cron to execute.
  -  if something is changed, rebuild the image with `docker-compose build`
  -  check for logs with: `docker logs turvis-pipeline`
  -  test queries should look like this:
  `curl -X post {{endpoint}}/path/to/call`
  when {{endpoint}} is not included, the script will be executed "as-is" meaning that if you have some other URL, then that would be executed directly, e.g. `curl www.google.com` would execute against `google.com`
  - hints: for the pipeline to call turvis, it needs to be on the same network in order to be visible. For this reason, docker-compose file specifies turvis_turvis network as external


## Feature/3
Regular expression management

An endpoint to allow calling regular expression on the content.

- make a POST request to `/regex/path/of/expression` and validate body
it is possible to pass extra parameters to regex:
- - named parameters:
   `/regex/email?minWidth=4&maxWidth=10` and it expects to find a regular expression and the regular expression itself has placeholders, e.g.
   `/^.{__minWidth__,__maxWidth__}$/`
- - positional parameters:
   `/regex/oneOf?params=a&params=b&params=c` and the pattern would be:
   `__1__|__2___|__3__` 

## Feature/20
Environment specific configuration with application.yml. It enables configuration for:
- directories for regular expressions, 
- directories for logs input/output and DSLs
- directory for http validation DSL
- enables to configure endpoint paths
- enbles to configure filedrop for log analysis
- specify what application.yml file to use through NODE_ENV variable: currently dev or prod only
- in docker build it defaults to dev, so it should be overridden for production

## Feature/22
- adds a logger that takes the level from config file and outputs to console/file based on config.
- Adds an interceptor for rewriting response code when configured in config file
- Improvements/refactorings to regex module.

## Feature/14
When ruuter-incoming endpoint is requested, it looks up default ruleset to apply and path specific.
Rulesest are expected to be configured in `/patterns/rulesets/*` directory.
