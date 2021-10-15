import Fastify from 'fastify'
import formBodyPlugin from 'fastify-formbody'
import fastifyPostgres from 'fastify-postgres'
import httpErrors from 'http-errors'

export default function (options = {}, pgOptions = {}) {
    const app = Fastify(options)
    app.register(formBodyPlugin)
    app.register(fastifyPostgres, pgOptions)
    app.addSchema({
        $id: 'todo',
        type: 'object',
        properties: {
            id: { type: 'number' },
            description: { type: 'string' },
            complete: { type: 'boolean' }
        }
    })
    app.get('/todos', {
        handler: async (request, reply) => {
            const res = await app.pg.query(
                'SELECT * FROM todos ORDER BY id'
            )
            return res.rows
        },
        schema: { response: { 200: { type: 'array', items: { $ref: 'todo#' } } } }
    })
    app.post('/todos', {
        handler: async (request, reply) => {
            const res = await app.pg.query(
                'INSERT INTO todos(description) VALUES($1) RETURNING id, description, complete',
                [request.body['description']]
            )
            return res.rows[0]
        },
        schema: { response: { 200: { $ref: 'todo#' } } }
    })
    app.post('/todos/:id', {
        handler: async (request, reply) => {
            return app.pg.transact(async client => {
                if (request.body['description']) {
                    await client.query(
                        'UPDATE todos SET description = $1 WHERE id = $2',
                        [request.body['description'], request.params['id']]
                    )
                }
                if (request.body['complete']) {
                    await client.query(
                        'UPDATE todos SET complete = $1 WHERE id = $2',
                        [request.body['complete'] === 'true', request.params['id']]
                    )
                }
                const res = await client.query(
                    'SELECT id, description, complete FROM todos WHERE id = $1', [request.params['id']]
                )
                return res.rows.length ? res.rows[0] : httpErrors.NotFound()
            })
        },
        schema: { response: { 200: { $ref: 'todo#' } } }
    })
    app.delete('/todos/:id', {
        handler: async (request, reply) => {
            const res = await app.pg.query(
                'DELETE FROM todos WHERE id = $1 RETURNING id, description, complete',
                [request.params['id']]
            )
            return res.rows.length ? res.rows[0] : httpErrors.NotFound()
        },
        schema: { response: { 200: { $ref: 'todo#' } } }
    })
    return app
}
