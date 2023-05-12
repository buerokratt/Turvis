.PHONY: build-image run stop

build-image:
	docker build -t buerokratt/ruuter-test -f Dockerfile.ruuter.yml .

start:
	docker-compose --file docker-compose.test.yml up -d

stop:
	docker-compose --file docker-compose.test.yml down
