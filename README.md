# todos

Simple backend for a to-do app, providing a database-backed JSON API implemented in JavaScript using [Fastify](https://www.fastify.io) and [PostgreSQL](https://www.postgresql.org). The semantics are based on the [Stripe API](https://stripe.com/docs/api) i.e. it accepts form-encoded request bodies, returns JSON-encoded responses (validated using JSON Schema), and uses standard HTTP response codes and verbs.

To run locally via Docker Compose ([V2](https://docs.docker.com/compose/cli-command/)):

```shell
docker compose up
```

A [Hurl](https://hurl.dev) file [is provided](todos.hurl), which both describes the API and can be used for black-box testing after bringing up the containers:

```shell
hurl --test todos.hurl
```

Alternatively you can use any other HTTP client e.g. curl:

```shell
curl -s localhost:3000/todos
curl -s -d description="Buy milk" localhost:3000/todos
curl -s -d complete=true localhost:3000/todos/1
curl -s -d -X DELETE localhost:3000/todos/1
```

Notes:
- [Integration tests](app.test.js) are implemented using `tap`. They are run automatically via GitHub Actions (GHA), but can also be executed locally:
  ```shell
  docker run -d -e POSTGRES_HOST_AUTH_METHOD=trust -p 127.0.0.1:5432:5432 postgres:14-alpine
  npm test
  ```
- The [GHA workflow](.github/workflows/ci.yml) also builds and publishes a [Docker image](../../pkgs/container/todos).
- This is not a production-ready API: it is (amongst other things) missing versioning, pagination, authentication, rate limiting and input validation (beyond escaping to avoid SQL injection). A sustainable version would benefit from using TypeScript with an ORM or query builder etc.
