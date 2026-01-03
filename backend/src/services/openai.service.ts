import OpenAI from 'openai';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import { Scene } from '../models/job.model.js';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

export class OpenAIService {
    /**
     * Generate a viral YouTube Shorts script
     */
    static async generateScript(topic: string, duration: number): Promise<string> {
        try {
            logger.info(`Generating script for topic: ${topic}, duration: ${duration}s`);

            const prompt = `Create a viral YouTube Shorts script about "${topic}".

Requirements:
- Duration: ${duration} seconds
- Include a STRONG hook in the first 3 seconds that grabs attention
- Split into 4-5 distinct scenes
- Each scene should be engaging and visual
- Use simple, conversational language
- End with a call-to-action or thought-provoking statement

Format your response as:
SCENE 1: [text for scene 1]
SCENE 2: [text for scene 2]
...

Make it viral-worthy!`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert YouTube Shorts scriptwriter who creates viral, engaging short-form content.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.8,
                max_tokens: 500,
            });

            const script = response.choices[0]?.message?.content || '';

            if (!script) {
                throw new Error('Failed to generate script - empty response');
            }

            logger.info('Script generated successfully');
            return script;
        } catch (error) {
            logger.error('Failed to generate script:', error);
            throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parse script into scenes with timing
     */
    static parseScriptIntoScenes(script: string, totalDuration: number): Scene[] {
        const sceneRegex = /SCENE\s+(\d+):\s*(.+?)(?=SCENE\s+\d+:|$)/gis;
        const matches = Array.from(script.matchAll(sceneRegex));

        if (matches.length === 0) {
            // Fallback: split by paragraphs
            const paragraphs = script.split('\n\n').filter(p => p.trim().length > 0);
            const sceneDuration = totalDuration / paragraphs.length;

            return paragraphs.map((text, index) => ({
                index: index + 1,
                text: text.trim(),
                imagePrompt: this.generateImagePrompt(text.trim()),
                duration: sceneDuration,
            }));
        }

        const sceneDuration = totalDuration / matches.length;

        return matches.map((match, index) => ({
            index: index + 1,
            text: match[2].trim(),
            imagePrompt: this.generateImagePrompt(match[2].trim()),
            duration: sceneDuration,
        }));
    }

    /**
     * Generate DALL-E prompt from scene text
     */
    private static generateImagePrompt(sceneText: string): string {
        // Extract key visual elements from the scene text
        const cleanText = sceneText.replace(/[^\w\s]/g, '').substring(0, 200);
        return `Cinematic vertical shot (9:16), ${cleanText}, professional photography, vibrant colors, no text, no words, high quality`;
    }

    /**
     * Generate image using DALL-E 3
     */
    static async generateImage(scene: Scene, jobDir: string): Promise<string> {
        try {
            logger.info(`Generating image for scene ${scene.index}: ${scene.imagePrompt.substring(0, 50)}...`);

            const response = await openai.images.generate({
                model: 'dall-e-3',
                prompt: scene.imagePrompt,
                n: 1,
                size: '1024x1792', // Vertical format (close to 9:16)
                quality: 'standard',
            });

            const imageUrl = response.data?.[0]?.url;

            if (!imageUrl) {
                throw new Error('No image URL in response');
            }

            // Download the image
            const imagePath = path.join(jobDir, `scene_${scene.index}.png`);
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            await fs.writeFile(imagePath, imageResponse.data);

            logger.info(`Image saved: ${imagePath}`);
            return imagePath;
        } catch (error) {
            logger.error(`Failed to generate image for scene ${scene.index}:`, error);
            throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate all images for scenes
     */
    static async generateAllImages(scenes: Scene[], jobDir: string): Promise<string[]> {
        const imagePaths: string[] = [];

        for (const scene of scenes) {
            const imagePath = await this.generateImage(scene, jobDir);
            imagePaths.push(imagePath);
            scene.imagePath = imagePath;
        }

        return imagePaths;
    }
}
