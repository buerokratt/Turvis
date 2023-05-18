.PHONY: build-image run stop

build-ruuter-image:
	docker build -t buerokratt/ruuter-test -f ruuter/Dockerfile.ruuter ./ --no-cache

build-turvis-image:
	docker build -t buerokratt/turvis-test .. --no-cache

start:
	docker-compose --file docker-compose.test.yml up -d

stop:
	docker-compose --file docker-compose.test.yml down
