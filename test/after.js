import pg from 'pg'

const client = new pg.Client({ connectionString: 'postgres://postgres@localhost' })
await client.connect()
await client.query('DROP DATABASE test_todos')
await client.end()
