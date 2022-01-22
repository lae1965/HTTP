const http = require('http');
const fs = require('fs');
const path = require('path');

const host = 'localhost';
const port = 8000;
const subDirName = 'files';

http.createServer((req, res) => {
    if (req.url === '/get' && req.method === 'GET') {
        try {
            const files = fs.readdirSync(path.join(__dirname, subDirName));
            res.writeHead(200);
            res.end(files.join(', '));
        } catch {
            res.writeHead(500);
            res.end('Internal server error');
        }
    } else if (req.url === '/post' && req.method === 'POST' || req.url === '/delete' && req.method === 'DELETE' || req.url === '/redirected' && req.method === 'GET') {
        res.writeHead(200);
        res.end('Success');
    } else if (req.url === '/redirect' && req.method === 'GET') {
        res.writeHead(301, {'Location': '/redirected'});
        res.end();
    } else if (req.url === '/get' || req.url === '/post' || req.url === '/delete' || req.url === '/redirect' || req.url === 'redirected') {
        res.writeHead(405);
        res.end('HTTP method not allowed');
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
}).listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
