# tests/integration/post-fragments.hurl
# Authenticated POST to /v1/fragments

POST http://localhost:80/v1/fragments

# We're sending a plain text fragment
Content-Type: text/plain

[BasicAuth]
wrong@email.com:incorrectPassword

# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# We expect to get back an HTTP 201
HTTP/1.1 401
# We have various assertions about the response that we want to check 
[Asserts]
# error message
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"
