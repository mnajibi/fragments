POST http://localhost:80/v1/fragments
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
{ 
  "service": "DynamoDB" 
}

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id" 

# 2. Try to GET the fragment we just posted by its URL
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 29

# 3. Post a markdown fragment
POST http://localhost:80/v1/fragments
Content-Type: text/markdown
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**`

# 4. We expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 5. Try to GET the fragment we just posted by its URL
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 21

# 6. Get all fragments
GET http://localhost:80/v1/fragments
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}

# 7. Delete fragment 1
DELETE {{fragment1_url}}
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 8. Try to GET the deleted fragment
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# 9. Get all fragments
GET http://localhost:80/v1/fragments
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}

# 7. Delete fragment 2
DELETE {{fragment2_url}}
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
