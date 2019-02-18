
#Pass cookie
curl -X GET http://localhost:3000/ -v -b cookie-file.txt


# save cookie
curl -X GET http://localhost:3000/ -v -c cookie-file.txt


#post login data along with cookie
curl -X POST http://localhost:3000/login -b cookie-file.txt -H 'Content-Type: application/json' -d '{"email": "test@test.com", "password" : "password"}'


# -L to follow redirects
curl -X GET http://localhost:3000/authrequired -b cookie-file.txt -L



# removed -X POST as otherwise on redirects to /login post, it'll post to /authrequired route as well on successfully redirect post login
curl http://localhost:3000/login -c cookie-file.txt -H 'Content-Type: application/json' -d '{"email":"test@test.com", "password":"password"}' -L


#Bcrypt password generator
https://www.browserling.com/tools/bcrypt