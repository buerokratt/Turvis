.PHONY: build-turvis-image build-ruuter-image run stop build

build-ruuter-image:
	docker build -t buerokratt/ruuter-test -f ruuter/Dockerfile.ruuter ./ --no-cache

build-turvis-image:
	docker build -t buerokratt/turvis-test .. --no-cache

start:
	docker-compose --file docker-compose.test.yml --env-file .env up -d

stop:
	docker-compose --file docker-compose.test.yml --env-file .env down

build:
	docker-compose --file docker-compose.test.yml --env-file .env build
