import axios from 'axios';
import config from './src/config/env.js';

async function listModels() {
    console.log('Checking available models...');
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.geminiApiKey}`;
        const response = await axios.get(url);

        console.log('Available Models:');
        const models = response.data.models;
        models.forEach((model: any) => {
            console.log(`- ${model.name} (${model.supportedGenerationMethods.join(', ')})`);
        });

    } catch (error) {
        console.error('Error listing models:', error.respone?.data || error.message);
    }
}

listModels();
