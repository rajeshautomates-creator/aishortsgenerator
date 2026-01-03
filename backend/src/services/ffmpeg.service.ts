import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { Scene } from '../models/job.model.js';
import logger from '../utils/logger.js';

export class FFmpegService {
    /**
     * Generate subtitle file (.srt) from scenes
     */
    static async generateSubtitles(scenes: Scene[], jobDir: string): Promise<string> {
        let srtContent = '';
        let currentTime = 0;

        scenes.forEach((_scene, _index) => {
            currentTime += _scene.duration;

            // Split long text into multiple subtitle entries
            const words = _scene.text.split(' ');
            const chunks: string[] = [];
            let currentChunk = '';

            words.forEach((word) => {
                if ((currentChunk + ' ' + word).length > 40) {
                    chunks.push(currentChunk.trim());
                    currentChunk = word;
                } else {
                    currentChunk += (currentChunk ? ' ' : '') + word;
                }
            });

            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }

            const chunkDuration = _scene.duration / chunks.length;
            let chunkTime = currentTime - _scene.duration;

            chunks.forEach((chunk, chunkIndex) => {
                const chunkStart = this.formatSrtTime(chunkTime);
                chunkTime += chunkDuration;
                const chunkEnd = this.formatSrtTime(chunkTime);

                srtContent += `${_index * 10 + chunkIndex + 1}\n`;
                srtContent += `${chunkStart} --> ${chunkEnd}\n`;
                srtContent += `${chunk}\n\n`;
            });
        });

        const srtPath = path.join(jobDir, 'subtitles.srt');
        await fs.writeFile(srtPath, srtContent);

        logger.info(`Subtitles generated: ${srtPath}`);
        return srtPath;
    }

    /**
     * Format time for SRT format (HH:MM:SS,mmm)
     */
    private static formatSrtTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    }

    /**
     * Create video from a single image
     */
    private static createImageVideo(imagePath: string, duration: number, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg(imagePath)
                .loop(duration)
                .outputOptions([
                    '-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
                    '-c:v libx264',
                    '-t ' + duration,
                    '-pix_fmt yuv420p',
                    '-r 30',
                ])
                .output(outputPath)
                .on('end', () => {
                    logger.debug(`Created video segment: ${outputPath}`);
                    resolve();
                })
                .on('error', (err) => {
                    logger.error(`Failed to create video segment: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Concatenate multiple video files
     */
    private static concatenateVideos(videoPaths: string[], outputPath: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // Create concat file
            const concatFilePath = path.join(path.dirname(outputPath), 'concat.txt');
            const concatContent = videoPaths.map(p => `file '${path.basename(p)}'`).join('\n');
            await fs.writeFile(concatFilePath, concatContent);

            ffmpeg()
                .input(concatFilePath)
                .inputOptions(['-f concat', '-safe 0'])
                .outputOptions(['-c copy'])
                .output(outputPath)
                .on('end', () => {
                    logger.debug(`Concatenated videos: ${outputPath}`);
                    resolve();
                })
                .on('error', (err) => {
                    logger.error(`Failed to concatenate videos: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Add audio to video
     */
    private static addAudio(videoPath: string, audioPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .input(audioPath)
                .outputOptions([
                    '-c:v copy',
                    '-c:a aac',
                    '-shortest',
                ])
                .output(outputPath)
                .on('end', () => {
                    logger.debug(`Added audio: ${outputPath}`);
                    resolve();
                })
                .on('error', (err) => {
                    logger.error(`Failed to add audio: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Burn subtitles into video
     */
    private static burnSubtitles(videoPath: string, subtitlePath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Escape the subtitle path for FFmpeg
            const escapedSubPath = subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:');

            ffmpeg(videoPath)
                .outputOptions([
                    `-vf subtitles='${escapedSubPath}':force_style='Alignment=2,FontSize=20,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1'`,
                    '-c:a copy',
                ])
                .output(outputPath)
                .on('end', () => {
                    logger.debug(`Burned subtitles: ${outputPath}`);
                    resolve();
                })
                .on('error', (err) => {
                    logger.error(`Failed to burn subtitles: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Main video generation pipeline
     */
    static async generateVideo(
        scenes: Scene[],
        audioPath: string,
        subtitlePath: string,
        jobDir: string,
        outputPath: string,
        onProgress?: (progress: number) => void
    ): Promise<void> {
        try {
            logger.info('Starting video generation pipeline...');

            // Step 1: Create video segments from images (65-75%)
            const videoSegments: string[] = [];
            for (let i = 0; i < scenes.length; i++) {
                const scene = scenes[i];
                if (!scene.imagePath) {
                    throw new Error(`Scene ${scene.index} missing image path`);
                }

                const segmentPath = path.join(jobDir, `segment_${i}.mp4`);
                await this.createImageVideo(scene.imagePath, scene.duration, segmentPath);
                videoSegments.push(segmentPath);

                if (onProgress) {
                    const progress = 65 + (10 * (i + 1)) / scenes.length;
                    onProgress(progress);
                }
            }

            // Step 2: Concatenate video segments (75-80%)
            const concatenatedPath = path.join(jobDir, 'concatenated.mp4');
            await this.concatenateVideos(videoSegments, concatenatedPath);
            if (onProgress) onProgress(80);

            // Step 3: Add audio (80-90%)
            const withAudioPath = path.join(jobDir, 'with_audio.mp4');
            await this.addAudio(concatenatedPath, audioPath, withAudioPath);
            if (onProgress) onProgress(90);

            // Step 4: Burn subtitles (90-100%)
            await this.burnSubtitles(withAudioPath, subtitlePath, outputPath);
            if (onProgress) onProgress(100);

            logger.info(`Video generation complete: ${outputPath}`);
        } catch (error) {
            logger.error('Video generation failed:', error);
            throw new Error(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
