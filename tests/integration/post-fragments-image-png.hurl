############ POST image/png file ############

POST http://localhost:80/v1/fragments
Content-Type: image/png
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
file,./cat.png;


# 1. We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:80\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/png"
# 19 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragment.size" == 126375

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

GET {{url}}.gif
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif; charset=utf-8

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
Content-Type: image/jpeg; charset=utf-8

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
Content-Type: image/png
