import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/env.js';
import logger from '../utils/logger.js';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export class ElevenLabsService {
    /**
     * Generate voice narration from script text
     */
    static async generateVoice(text: string, jobDir: string): Promise<string> {
        try {
            logger.info(`Generating voice narration (Key: ${config.elevenlabsApiKey.substring(0, 4)}****)...`);

            // Use a default voice ID (you can make this configurable)
            const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Rachel voice

            const response = await axios.post(
                `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
                {
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                },
                {
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': config.elevenlabsApiKey,
                    },
                    responseType: 'arraybuffer',
                }
            );

            const audioPath = path.join(jobDir, 'narration.mp3');
            await fs.writeFile(audioPath, response.data);

            logger.info(`Voice narration saved: ${audioPath}`);
            return audioPath;
        } catch (error) {
            logger.error('Failed to generate voice:', error);

            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const message = error.response?.data?.detail?.message || error.message;
                throw new Error(`Voice generation failed (${status}): ${message}`);
            }

            throw new Error(`Voice generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get available voices (optional - for future enhancement)
     */
    static async getVoices(): Promise<any[]> {
        try {
            const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
                headers: {
                    'xi-api-key': config.elevenlabsApiKey,
                },
            });

            return response.data.voices || [];
        } catch (error) {
            logger.error('Failed to fetch voices:', error);
            return [];
        }
    }
}
