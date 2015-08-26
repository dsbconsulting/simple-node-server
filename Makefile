all: build
build:
	docker build --no-cache=true -t source2 .
run:
	docker run -d --net=host --name source2-container  source2
runbash:
	docker run -it --name source2-container --rm --net=host source2 /bin/bash
stop:
	docker stop source2-container
	docker rm source2-container
run_dbs:
	docker run --name source2-redis -d --net=host  -p 6379:6379 redis
	docker run --name source2-pg --net=host -p 5432:5432 -e POSTGRES_PASSWORD=secret -d postgres
stop_db:
	docker stop source2-redis source2-pg 
	docker rm source2-pg source2-redis
