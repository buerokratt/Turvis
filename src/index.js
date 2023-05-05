const http = require("http");

const host = 'localhost';
const port = 3030;

const requestHandler = (request, response) => {
    response.writeHead(200);
    response.end("ok");
}

const server =  http.createServer(requestHandler);
server.listen(port, host, () => {
    console.log(`Turvis started on http://${host}:${port}`);
});