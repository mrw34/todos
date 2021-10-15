import { test, beforeEach, afterEach } from 'tap'
import formAutoContent from 'form-auto-content'
import pg from 'pg'
import { readFile } from 'node:fs/promises'
import build from './app.js'

const connectionString = 'postgres://postgres@localhost/test_todos'

beforeEach(async t => {
    const client = new pg.Client({ connectionString })
    await client.connect()
    await client.query(await readFile('schema.sql', 'utf8'))
    await client.query("INSERT INTO todos (description, complete) VALUES ('One', true), ('Two', false), ('Three', false)")
    t.context.client = client
})

afterEach(async t => {
    const client = t.context.client
    await client.query('DROP TABLE todos')
    await client.end()
})

test('lists todos', async t => {
    const app = build({}, { connectionString })
    t.teardown(() => app.close())

    const response = await app.inject({
        method: 'GET',
        url: '/todos'
    })
    t.equal(response.statusCode, 200)
    t.same(response.json(), [
        { id: 1, description: 'One', complete: true },
        { id: 2, description: 'Two', complete: false },
        { id: 3, description: 'Three', complete: false }
    ])
})

test('creates todo', async t => {
    const app = build({}, { connectionString })
    t.teardown(() => app.close())

    const response = await app.inject({
        method: 'POST',
        url: '/todos',
        ...formAutoContent({ description: 'Four' })
    })
    t.equal(response.statusCode, 200)
    t.same(response.json(), { id: 4, description: 'Four', complete: false })
    const res = await t.context.client.query("SELECT COUNT(1) FROM todos")
    t.equal(Number(res.rows[0]["count"]), 4)
})

test('updates todo', async t => {
    const app = build({}, { connectionString })
    t.teardown(() => app.close())

    const response = await app.inject({
        method: 'POST',
        url: '/todos/2',
        ...formAutoContent({ description: 'Deux', complete: true })
    })
    t.equal(response.statusCode, 200)
    t.same(response.json(), { id: 2, description: 'Deux', complete: true })
})

test('updates non-existent todo', async t => {
    const app = build({}, { connectionString })
    t.teardown(() => app.close())

    const response = await app.inject({
        method: 'POST',
        url: '/todos/22',
        ...formAutoContent({ description: 'Deux', complete: true })
    })
    t.equal(response.statusCode, 404)
})

test('deletes todo', async t => {
    const app = build({}, { connectionString })
    t.teardown(() => app.close())

    const response = await app.inject({
        method: 'DELETE',
        url: '/todos/3'
    })
    t.equal(response.statusCode, 200)
    t.same(response.json(), { id: 3, description: 'Three', complete: false })
    const res = await t.context.client.query("SELECT COUNT(1) FROM todos")
    t.equal(Number(res.rows[0]["count"]), 2)
})

test('deletes non-existent todo', async t => {
    const app = build({}, { connectionString })
    t.teardown(() => app.close())

    const response = await app.inject({
        method: 'DELETE',
        url: '/todos/22'
    })
    t.equal(response.statusCode, 404)
    const res = await t.context.client.query("SELECT COUNT(1) FROM todos")
    t.equal(Number(res.rows[0]["count"]), 3)
})
