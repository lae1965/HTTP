const http = require('http');
const fs = require('fs');
const path = require('path');

const host = 'localhost';
const port = 8000;
const user = {
    id: '123',
    username: 'testuser',
    password: 'qwerty'
};
dirname = 'files';

// Я не стал делать на express, т.к. это слишком просто, а хочется разобраться с механизмом нативной работы 

const parseCookiesListToObject = (req) => {                // Преобразуем массив cookie в объект
    let cookiesArray = {};
    req.headers['cookie']?.split('; ').forEach((cookie) => {
        cookie = cookie.split('=');
        cookiesArray[cookie[0]] = cookie[1];
    });
    return cookiesArray;
}

const parseBody = (req, callback) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => {
        callback(JSON.parse(body));
    });
}

const authorization = (req, res, callback) => {
    const cookiesArray = parseCookiesListToObject(req);
    if (!!cookiesArray && cookiesArray.authorized === 'true' && cookiesArray.userId === user.id) {
        parseBody(req, callback);
    } else {
        res.writeHead(401).end('Available only to authorized users');
    }
}

http.createServer((req, res) => {
    if (req.url === '/auth') {
        if (req.method === 'POST') {
            parseBody(req, (body) => {
                if (body?.username === user.username && body?.password === user.password) {
                    res.writeHead(200, {
                        'Set-Cookie': [
                            'authorized=true; MAX_AGE=172800; path=/;', 
                            `userId=${user.id}; MAX_AGE=172800; path=/;`
                        ]
                    }).end('Authorization is OK');
                } else {
                    res.writeHead(400).end('Wrong login or password');
                } 
            });
        } else {
            res.writeHead(405).end('HTTP method not allowed');
        }
    } else if (req.url === '/post') {
        if (req.method === 'POST') {
            authorization(req, res, (body) => {
                fs.writeFile(path.join(__dirname, dirname, body.filename), body.content, (err) => {
                    if (err) {
                        res.writeHead(500).end('Internal server error');
                        throw(err);
                    }
                    res.writeHead(200).end(`The data has been successfully written to the file ${body.filename}`);
                });
            });
        } else {
            res.writeHead(405).end('HTTP method not allowed');
        }
    } else if (req.url === '/delete') {
        if (req.method === 'DELETE') {
            authorization(req, res, (body) => {
                fs.unlink(path.join(__dirname, dirname, body.filename), (err) => {
                    if (err) {
                        res.writeHead(500).end('Internal server error');
                        throw(err);
                    }
                    res.writeHead(200).end(`The file ${body.filename} has been successfully removed`);
                });
            });
        } else {
            res.writeHead(405).end('HTTP method not allowed');
        }
    } else {
        res.writeHead(404).end('Not found');
    }
}).listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});