# Posting unsupported Content-Type produces 415 error

POST http://localhost:80/v1/fragments
# We're sending a css fragment
Content-Type: text/css
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`css file`

# 1. We expect to get back an HTTP 201
HTTP/1.1 415

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
jsonpath "$.error.message" == "text/css is not supported"
