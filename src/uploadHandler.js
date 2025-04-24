const fileHandler = require('./fileHandler');

async function handleFileUpload(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                if (data.mediaFile) {
                    const fileName = await fileHandler.saveMedia(data.mediaFile);
                    data.mediaFile = fileName;
                }
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

module.exports = { handleFileUpload };