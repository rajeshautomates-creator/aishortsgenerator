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
    geminiApiKey: string;
}

const config: Config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    openaiApiKey: (process.env.OPENAI_API_KEY || '').trim(),
    elevenlabsApiKey: (process.env.ELEVENLABS_API_KEY || 'sk_85328fcbfa0d398b216086d721bdf46b831dad83aa38e01f').trim(),
    adminPassword: process.env.ADMIN_PASSWORD || 'Rajesh#3210',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    uploadsDir: process.env.UPLOADS_DIR || './uploads',
    outputsDir: process.env.OUTPUTS_DIR || './outputs',
    geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
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
