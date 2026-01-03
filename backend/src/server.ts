import express from 'express';
import cors from 'cors';
import path from 'path';
// import { fileURLToPath } from 'url';
import config from './config/env.js';
import logger from './utils/logger.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import { errorHandler } from './middleware/errorHandler.js';
import { FileManager } from './utils/fileManager.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure directories exist
await FileManager.ensureDir(config.uploadsDir);
await FileManager.ensureDir(config.outputsDir);

// Static files for video preview (protected via frontend, or can be made public)
app.use('/outputs', express.static(config.outputsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
    const passSource = process.env.ADMIN_PASSWORD ? 'Environment Variable' : 'Default Code Password';
    logger.info(`🔐 Admin access: ${passSource} (Length: ${config.adminPassword.length})`);

    // Masked API key logging for verification
    const mask = (key: string) => key ? `${key.substring(0, 4)}****` : 'NOT SET';
    logger.info(`🔑 OpenAI Key check: ${mask(config.openaiApiKey)}`);
    logger.info(`🔑 ElevenLabs Key check: ${mask(config.elevenlabsApiKey)}`);

    logger.info(`📂 Uploads directory: ${path.resolve(config.uploadsDir)}`);
    logger.info(`🎬 Outputs directory: ${path.resolve(config.outputsDir)}`);
});
