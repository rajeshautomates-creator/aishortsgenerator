import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import axios from 'axios';
import config from './src/config/env.js';

async function listModels() {
    console.log('Checking available models...');
    console.log(`API Key present: ${!!config.geminiApiKey}`);

    if (!config.geminiApiKey) {
        console.error('ERROR: GEMINI_API_KEY not found in .env');
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.geminiApiKey}`;
        const response = await axios.get(url);

        console.log('Available Models:');
        const models = response.data.models;
        models.forEach((model: any) => {
            console.log(`- ${model.name} (${model.supportedGenerationMethods.join(', ')})`);
        });

    } catch (error) {
        const msg = error.response?.data?.error?.message || error.message;
        console.error('Error listing models:', msg);
    }
}

listModels();
