POST localhost:3000/todos
[FormParams]
description: "Whisk eggs"
HTTP/1.1 200
[Captures]
id: jsonpath "$['id']"

POST localhost:3000/todos/{{id}}
[FormParams]
complete: true
HTTP/1.1 200

GET localhost:3000/todos
HTTP/1.1 200

DELETE localhost:3000/todos/{{id}}
HTTP/1.1 200
