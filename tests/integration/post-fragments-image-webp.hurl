############ POST image/webp file ############

POST http://localhost:80/v1/fragments
Content-Type: image/webp
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
file,./cat.webp;

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/webp"
jsonpath "$.fragment.size" == 115474

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

####### GET .gif #######

GET {{url}}.gif
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif

####### GET .jpg #######

GET {{url}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpeg

####### GET .webp #######

GET {{url}}.webp
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp

####### GET .png #######

GET {{url}}.png
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png
