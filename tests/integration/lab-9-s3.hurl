################### POST TEST ###################
POST http://0.0.0.0:80/v1/fragments
Content-Type: text/plain; charset=utf-8
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
`Hello S3!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
url: header "Location"
fragment_id: jsonpath "$.fragment.id"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

#3. Delete
DELETE http://localhost:80/v1/fragments/{{fragment_id}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

#4. Try to GET again, should return 404
GET {{url}}
[BasicAuth]
user1@email.com:password1


HTTP/1.1 404
