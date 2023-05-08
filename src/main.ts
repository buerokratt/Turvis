import fastify from "fastify";

const app = fastify();

// pass in the port with configuration
const PORT = 3030

app.get('/', async (request, response) => {
    return { message: 'ok'}
});

app.listen({ port: PORT }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Turvis is listening at ${address}`)
});