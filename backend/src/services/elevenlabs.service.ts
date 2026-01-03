import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export class ElevenLabsService {
    /**
     * Generate voice narration from script text
     */
    static async generateVoice(text: string, jobDir: string): Promise<string> {
        try {
            if (!config.elevenlabsApiKey) {
                throw new Error("ElevenLabs API key missing");
            }

            const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

            logger.info(`Generating voice (voiceId=${voiceId})`);

            const response = await axios.post(
                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                {
                    text,
                    model_id: 'eleven_multilingual_v2', // ✅ FIX
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                },
                {
                    headers: {
                        'xi-api-key': config.elevenlabsApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'audio/mpeg'
                    },
                    responseType: 'arraybuffer',
                    timeout: 30000
                }
            );

            const audioPath = path.join(jobDir, 'narration.mp3');
            await fs.writeFile(audioPath, Buffer.from(response.data));

            logger.info(`Voice narration saved: ${audioPath}`);
            return audioPath;

        } catch (error: any) {
            logger.error('Failed to generate voice:', error);
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const body = error.response?.data?.toString();
                throw new Error(`ElevenLabs ${status}: ${body}`);
            }
            throw error;
        }
    }

    /**
     * Get available voices
     */
    static async getVoices(): Promise<any[]> {
        try {
            const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
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
