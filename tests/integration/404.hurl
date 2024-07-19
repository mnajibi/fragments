# Health Check Test
GET http://localhost:8080/non-existent-route

# We should get back an HTTP 1.1 200 response
HTTP/1.1 404

[Asserts]
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "Not found"
