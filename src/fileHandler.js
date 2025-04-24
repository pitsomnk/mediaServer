const fs = require('fs').promises;
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/mediaData.json');
const mediaFolderPath = path.join(__dirname, '../public/media');
const htmlPath = path.join(__dirname, '../public/docs.html');

class FileHandler {
    async initializeStorage() {
        try {
            // Create directories if they don't exist
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
            await fs.mkdir(mediaFolderPath, { recursive: true });

            // Initialize data file if it doesn't exist
            try {
                await fs.access(dataFilePath);
            } catch {
                const initialData = {
                    movies: [],
                    series: [],
                    songs: []
                };
                await this.writeData(initialData);
            }
        } catch (error) {
            console.error('Error initializing storage:', error);
            throw error;
        }
    }

    async readData() {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    }

    async writeData(data) {
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    }

    async saveMedia(file) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(mediaFolderPath, fileName);
        await fs.writeFile(filePath, file.data);
        return fileName;
    }

    async deleteMedia(fileName) {
        const filePath = path.join(mediaFolderPath, fileName);
        await fs.unlink(filePath);
    }

    async serveHTML(res) {
        try {
            const html = await fs.readFile(htmlPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }

    async handleMediaDownload(res, fileName) {
        try {
            const filePath = path.join(mediaFolderPath, fileName);
            const file = await fs.readFile(filePath);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${fileName}"`
            });
            res.end(file);
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        }
    }
}

module.exports = new FileHandler();