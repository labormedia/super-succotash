TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlcnVzZXIiLCJpc3MiOiJhcHAuZXhhbXBsZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU5MDYzNDU0Mn0._kqFHJ5sl4iwrjzcXq6BIs7MIb3-W8HAMgAAyRbLHSY

curl -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXBwLmV4YW1wbGUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1OTA0NzQwNzZ9.eiGkVWORSlGbUGLqgFPMnNk1ldMunkS2x437rlyJ3XI" https://127.0.0.1:10443/api/v1/user/add?id=000 --insecure
curl -d '{"username":"user", "password":"password"}' -H "Content-Type: application/json" -X POST http://127.0.0.1:10010/api/v1/login/admin --insecure
curl -d '{"username":"user", "password":"password", "role":"user", "domain": "redis"}' -H "Content-Type: application/json" -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlcnVzZXIiLCJpc3MiOiJhcHAuZXhhbXBsZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU5MDYzNDU0Mn0._kqFHJ5sl4iwrjzcXq6BIs7MIb3-W8HAMgAAyRbLHSY" http://127.0.0.1:10010/api/v1/user/add --insecure
curl -d '{"username":"user", "password":"password", "domain":"ibm", "role":"user"}' -H "Content-Type: application/json" -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlcnVzZXIiLCJpc3MiOiJhcHAuZXhhbXBsZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU5MDYzNDU0Mn0._kqFHJ5sl4iwrjzcXq6BIs7MIb3-W8HAMgAAyRbLHSY" https://127.0.0.1:10443/api/v1/tenant/add --insecure




join_room:
    curl -d '{"username":"superuser", "password":"cat", "title": "My first room","domain":"redis", "role":"admin"}' -H "Content-Type: application/json" -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXBwLmV4YW1wbGUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1OTA0NzQwNzZ9.eiGkVWORSlGbUGLqgFPMnNk1ldMunkS2x437rlyJ3XI" https://127.0.0.1:10443/api/v1/room/join --insecure

get_profile
    curl -d '{"username":"superuser", "password":"cat", "title": "My first room","domain":"redis", "role":"admin"}' -H "Content-Type: application/json" -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXBwLmV4YW1wbGUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1OTA0NzQwNzZ9.eiGkVWORSlGbUGLqgFPMnNk1ldMunkS2x437rlyJ3XI" https://127.0.0.1:10443/api/v1/user/get/profile --insecure

get_rooms
    curl -d '{"username":"superuser", "password":"cat", "title": "My first room","domain":"redis", "role":"admin"}' -H "Content-Type: application/json" -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaXNzIjoiYXBwLmV4YW1wbGUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1OTA0NzQwNzZ9.eiGkVWORSlGbUGLqgFPMnNk1ldMunkS2x437rlyJ3XI" https://127.0.0.1:10443/api/v1/user/get/rooms --insecure
