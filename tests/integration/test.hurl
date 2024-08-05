################### POST TEST ###################
POST http://localhost:80/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`Hello S3!`

HTTP/1.1 201
[Captures]
url: header "Location"
fragment_id: jsonpath "$.fragment.id"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

################### DELETE TEST ###################
DELETE http://localhost:80/v1/fragments/{{fragment_id}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

################### VERIFY DELETE ###################
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
