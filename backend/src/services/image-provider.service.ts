import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import { Scene } from '../models/job.model.js';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export class ImageProviderService {
    /**
     * Generate image with fallback logic (OpenAI -> Gemini)
     */
    static async generateImageWithFallback(scene: Scene, jobDir: string): Promise<string> {
        try {
            // 1. Try OpenAI as primary provider
            logger.info(`[OpenAI] Generating image for scene ${scene.index}`);
            return await this.generateWithOpenAI(scene, jobDir);
        } catch (error) {
            const isFallbackEligible = this.checkIfFallbackEligible(error);

            if (isFallbackEligible) {
                logger.warn(`OpenAI failed, falling back to Gemini for scene ${scene.index}. Error: ${error instanceof Error ? error.message : 'Unknown'}`);
                try {
                    // 2. Try Gemini as fallback provider
                    logger.info(`[Gemini] Generating image for scene ${scene.index}`);
                    return await this.generateWithGemini(scene, jobDir);
                } catch (geminiError) {
                    logger.error(`Gemini also failed for scene ${scene.index}:`, geminiError);
                    throw new Error(`Both OpenAI and Gemini failed to generate image. Gemini error: ${geminiError instanceof Error ? geminiError.message : 'Unknown'}`);
                }
            } else {
                // Not a fallback-eligible error (e.g., local file system error)
                logger.error(`OpenAI failed with non-fallback error for scene ${scene.index}:`, error);
                throw error;
            }
        }
    }

    /**
     * Generate image using OpenAI DALL-E 3
     */
    private static async generateWithOpenAI(scene: Scene, jobDir: string): Promise<string> {
        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: scene.imagePrompt,
            n: 1,
            size: '1024x1792', // Vertical format (close to 9:16)
            quality: 'standard',
        });

        const imageUrl = response.data?.[0]?.url;

        if (!imageUrl) {
            throw new Error('No image URL in OpenAI response');
        }

        // Download the image
        const imagePath = path.join(jobDir, `scene_${scene.index}_openai.png`);
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        await fs.writeFile(imagePath, imageResponse.data);

        logger.info(`[OpenAI] Image saved: ${imagePath}`);
        return imagePath;
    }

    /**
     * Generate image using Google Gemini (Imagen)
     */
    private static async generateWithGemini(scene: Scene, jobDir: string): Promise<string> {
        if (!config.geminiApiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        // Gemini Prompt Format
        const geminiPrompt = `Cinematic 9:16 vertical shot, ${scene.imagePrompt}, professional photography, vibrant colors, no text, no words, story scene based, high quality, highly detailed`;

        // The user specifically requested this model
        const modelName = 'gemini-1.5-flash';

        try {
            logger.info(`[Gemini] Attempting to generate image with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(geminiPrompt);
            const response = await result.response;

            // Log full response for debugging if needed
            // logger.debug(`[Gemini] Full response: ${JSON.stringify(response)}`);

            // Note: Gemini API returns images as base64 in the response parts
            const parts = response.candidates?.[0]?.content?.parts;
            const imagePart = parts?.find(part => part.inlineData?.mimeType?.startsWith('image/'));

            if (!imagePart || !imagePart.inlineData?.data) {
                // If it returned text instead (common with non-image-gen models)
                const textPart = parts?.find(part => part.text);
                if (textPart && textPart.text) {
                    throw new Error(`Model ${modelName} returned text instead of image: "${textPart.text.substring(0, 100)}..."`);
                }
                throw new Error('No image data in Gemini response');
            }

            const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
            const imagePath = path.join(jobDir, `scene_${scene.index}_gemini.png`);
            await fs.writeFile(imagePath, imageBuffer);

            logger.info(`[Gemini] Image saved: ${imagePath} using model ${modelName}`);
            return imagePath;

        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error(`[Gemini] Model ${modelName} failed: ${msg}`);
            throw error;
        }
    }

    /**
     * Check if the error from OpenAI justifies falling back
     */
    private static checkIfFallbackEligible(error: any): boolean {
        // Handle OpenAI API errors
        if (error && typeof error === 'object') {
            const status = error.status || error.statusCode || (error.response && error.response.status);
            const code = error.code || (error.error && error.error.code);

            // billing_hard_limit_reached, quota_exceeded
            if (code === 'billing_hard_limit_reached' || code === 'quota_exceeded' || code === 'insufficient_quota') {
                return true;
            }

            // 400 (Bad Request), 429 (Too Many Requests), 500 (Internal Server Error)
            if (status === 400 || status === 429 || status >= 500) {
                return true;
            }
        }

        const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if (message.includes('billing') || message.includes('quota') || message.includes('limit')) {
            return true;
        }

        return false;
    }
}
