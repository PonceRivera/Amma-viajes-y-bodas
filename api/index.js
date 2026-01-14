// Vercel Serverless Function entry point for Angular SSR + Express
// This file acts as the bridge between Vercel's serverless environment and the Angular SSR server

const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import the compiled Express app
// Note: This requires the build output to be available
let handler;

async function getHandler() {
    if (!handler) {
        try {
            const serverModule = await import('../dist/ammaviajes/server/server.mjs');
            handler = serverModule.reqHandler || serverModule.default;
        } catch (error) {
            console.error('Failed to load server module:', error);
            throw error;
        }
    }
    return handler;
}

module.exports = async (req, res) => {
    try {
        const h = await getHandler();
        return h(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
