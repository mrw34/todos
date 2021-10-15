import build from './app.js'

const server = build({ logger: true })

try {
    await server.listen(3000, '0.0.0.0')
} catch (err) {
    server.log.error(err)
    process.exit(1)
}
