############ POST image/jpeg file ############

POST http://localhost:80/v1/fragments
Content-Type: image/jpeg
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
file,./cat.jpg;

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/jpeg"
jsonpath "$.fragment.size" == 33788

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

####### GET .gif #######

GET {{url}}.gif
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif; charset=utf-8

####### GET .jpg #######

GET {{url}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpeg
file,cat.jpg;

####### GET .webp #######

GET {{url}}.webp
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp; charset=utf-8

####### GET .png #######

GET {{url}}.png
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png; charset=utf-8
