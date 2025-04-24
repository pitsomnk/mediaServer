const http = require('http');
const url = require('url');
const path = require('path');
const fileHandler = require('./src/fileHandler');
const { handleFileUpload } = require('./src/uploadHandler');

const port = 3000;

// Initialize storage when server starts
fileHandler.initializeStorage().catch(console.error);

async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        // Serve API documentation on root path
        if (pathname === '/') {
            return await fileHandler.serveHTML(res);
        }

        // Handle media downloads
        if (pathname.startsWith('/download/')) {
            const fileName = pathname.split('/download/')[1];
            return await fileHandler.handleMediaDownload(res, fileName);
        }

        // Handle API endpoints
        switch (method) {
            case 'GET':
                await handleGet(pathname, res);
                break;
            case 'POST':
                await handlePost(pathname, req, res);
                break;
            case 'PUT':
                await handlePut(pathname, req, res);
                break;
            case 'DELETE':
                await handleDelete(pathname, parsedUrl.query, res);
                break;
            default:
                res.writeHead(405, { 'Content-Type': 'text/plain' });
                res.end('Method not allowed');
        }
    } catch (error) {
        console.error('Request handling error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function handleGet(pathname, res) {
    const data = await fileHandler.readData();
    switch (pathname) {
        case '/movies':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data.movies));
            break;
        case '/series':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data.series));
            break;
        case '/songs':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data.songs));
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Route not found');
    }
}

async function handlePost(pathname, req, res) {
    const data = await handleFileUpload(req);
    const mediaData = await fileHandler.readData();
    
    switch (pathname) {
        case '/movies':
            mediaData.movies.push(data);
            await fileHandler.writeData(mediaData);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mediaData.movies));
            break;
        case '/series':
            mediaData.series.push(data);
            await fileHandler.writeData(mediaData);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mediaData.series));
            break;
        case '/songs':
            mediaData.songs.push(data);
            await fileHandler.writeData(mediaData);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mediaData.songs));
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Route not found');
    }
}

async function handlePut(pathname, req, res) {
    const data = await handleFileUpload(req);
    const mediaData = await fileHandler.readData();
    const id = data.id;

    switch (pathname) {
        case '/movies':
            const movieIndex = mediaData.movies.findIndex(m => m.id === id);
            if (movieIndex !== -1) {
                mediaData.movies[movieIndex] = data;
                await fileHandler.writeData(mediaData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mediaData.movies));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Movie not found');
            }
            break;
        // Similar cases for series and songs
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Route not found');
    }
}

async function handleDelete(pathname, query, res) {
    const id = parseInt(query.id);
    const mediaData = await fileHandler.readData();

    switch (pathname) {
        case '/movies':
            const movieIndex = mediaData.movies.findIndex(m => m.id === id);
            if (movieIndex !== -1) {
                const movie = mediaData.movies[movieIndex];
                if (movie.mediaFile) {
                    await fileHandler.deleteMedia(movie.mediaFile);
                }
                mediaData.movies.splice(movieIndex, 1);
                await fileHandler.writeData(mediaData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mediaData.movies));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Movie not found');
            }
            break;
        // Similar cases for series and songs
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Route not found');
    }
}

const server = http.createServer(handleRequest);

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});