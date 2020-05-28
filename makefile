version:
	@echo "0.0.1-0-alpha"

all:
	make stop
	make clean
	make build
	make compose
	make init

configure:
	docker network create --gateway 172.16.238.1 --subnet 172.16.238.0/24 tests
	docker-compose build --no-cache

build:
	@echo "Installing..."
	cd service; npm i
	pwd
	cd redis-api; npm i
	mkdir certs;
	openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365
	mkdir logs

clean:
	make stop
	@echo "Cleaning up..."
	rm -rf service/node_modules
	rm -rf redis-api/node_modules
	rm -rf certs
	rm -rf logs

run:
	@echo "Starting services..."
	NODE_ENV=development swagger project start redis-api > logs/swagger-debug.log 2>&1 &
	NODE_ENV=development node service/server.js > logs/service-debug.log 2>&1 &

stop:
	@echo "Stopping services..."
	for number in `ps -ef | awk '/[s]wagger project start redis-api/{print $$2}'` ; do echo killing pid $$number; kill -9 $$number ; done
	for number in `ps -ef | awk '/[s]wagger-project.js/{print $$2}'` ; do echo killing pid $$number; kill -9 $$number ; done
	for number in `ps -ef | awk '/[n]ode\sservice\/server.js/{print $$2}'` ; do echo killing pid $$number; kill -9 $$number ; done
	for number in `ps -ef | awk '/[n]ode\sapp.js/{print $$2}'` ; do echo killing pid $$number; kill -9 $$number ; done
	for number in `ps -ef | awk '/tail\s-f\s.\/logs\/service-debug.log/{print $$2}'` ; do echo killing pid $$number; kill -9 $$number ; done

show:
	echo "processes"
	ps -ef | awk '/[s]wagger\sproject start redis-api/{print $$2}'
	ps -ef | awk '/[s]wagger-project.js/{print $$2}'
	ps -ef | awk '/[n]ode\sservice\/server.js/{print $$2}'
	ps -ef | awk '/[n]ode\sapp.js/{print $$2}'
	ps -ef | awk '/tail\s-f\s.\/logs\/service-debug.log/{print $$2}'

debug:
	{ tail -f ./logs/service-debug.log & tail -f ./logs/swagger-debug.log; }

compose:
	docker-compose up --force-recreate > logs/docker-debug.log 2>&1 &

undocker:
	docker-compose stop
	docker network remove tests

init:
	cd redis-api/config && NODE_ENV=development node generate-key.js
	
tests:
	curl -d '{"username":"superuser", "password":"cat", "title": "My second room","domain":"redis", "role":"admin"}' -H "Content-Type: application/json" -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXBwLmV4YW1wbGUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1OTA0NzQwNzZ9.eiGkVWORSlGbUGLqgFPMnNk1ldMunkS2x437rlyJ3XI" https://127.0.0.1:10443/api/v1/room/join --insecure

docs:
	cd redis-api && swagger project edit