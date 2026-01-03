import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    openaiApiKey: string;
    elevenlabsApiKey: string;
    adminPassword: string;
    jwtSecret: string;
    uploadsDir: string;
    outputsDir: string;
}

const config: Config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || '',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    uploadsDir: process.env.UPLOADS_DIR || './uploads',
    outputsDir: process.env.OUTPUTS_DIR || './outputs',
};

// Validate required environment variables
const validateConfig = () => {
    const required = ['openaiApiKey', 'elevenlabsApiKey'];
    const missing = required.filter((key) => !config[key as keyof Config]);

    if (missing.length > 0) {
        console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
        console.warn('The application may not function correctly without these variables.');
    }
};

validateConfig();

export default config;
