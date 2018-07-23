.PHONY: build test coverage shell down lint

YML_DEV=environment/dev/docker-compose.yml
COMPOSE_DEV=docker-compose -f ${YML_DEV}

build:
	${COMPOSE_DEV} build

publish: build down
	${COMPOSE_DEV} run --rm --no-deps --service-ports hancock_sdk_client publish

test: build down
	${COMPOSE_DEV} run --rm --no-deps --service-ports hancock_sdk_client test

coverage: build down
	${COMPOSE_DEV} run --rm --no-deps --service-ports hancock_sdk_client coverage

lint: build down
	${COMPOSE_DEV} run --rm --no-deps --service-ports hancock_sdk_client lint

shell: build down
	${COMPOSE_DEV} run --rm --no-deps hancock_sdk_client /bin/bash

down:
	${COMPOSE_DEV} down