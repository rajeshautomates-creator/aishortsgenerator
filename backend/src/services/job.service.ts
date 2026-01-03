import { v4 as uuidv4 } from 'uuid';
import { jobStore, Job } from '../models/job.model.js';
import { OpenAIService } from './openai.service.js';
import { ElevenLabsService } from './elevenlabs.service.js';
import { FFmpegService } from './ffmpeg.service.js';
import { FileManager } from '../utils/fileManager.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';
// import path from 'path';

export class JobService {
    /**
     * Create a new video generation job
     */
    static async createJob(topic: string, duration: number): Promise<Job> {
        const jobId = uuidv4();
        const job: Job = {
            id: jobId,
            topic,
            duration,
            status: 'pending',
            progress: 0,
            createdAt: new Date(),
            logs: [`Job created for topic: ${topic}`],
        };

        jobStore.create(job);

        // Start processing in the background
        this.processJob(jobId).catch((err) => {
            logger.error(`Background processing failed for job ${jobId}:`, err);
        });

        return job;
    }

    /**
     * Orchestrate the video generation process
     */
    private static async processJob(jobId: string): Promise<void> {
        const job = jobStore.get(jobId);
        if (!job) return;

        const jobDir = FileManager.getJobDir(jobId, config.uploadsDir);
        const outputPath = FileManager.getOutputPath(jobId, config.outputsDir);

        try {
            jobStore.update(jobId, { status: 'processing', progress: 5 });
            jobStore.addLog(jobId, 'Starting processing...');

            // 1. Ensure directories exist
            await FileManager.ensureDir(jobDir);
            await FileManager.ensureDir(config.outputsDir);

            // 2. Generate Script
            jobStore.addLog(jobId, 'Generating script with OpenAI...');
            const script = await OpenAIService.generateScript(job.topic, job.duration);
            const scenes = OpenAIService.parseScriptIntoScenes(script, job.duration);

            jobStore.update(jobId, {
                progress: 15,
                metadata: { ...job.metadata, script, scenes }
            });
            jobStore.addLog(jobId, `Script generated with ${scenes.length} scenes.`);

            // 3. Generate Voice
            jobStore.addLog(jobId, 'Generating voice with ElevenLabs...');
            const audioPath = await ElevenLabsService.generateVoice(
                scenes.map(s => s.text).join(' '),
                jobDir
            );

            jobStore.update(jobId, {
                progress: 25,
                metadata: { ...jobStore.get(jobId)?.metadata, audioPath }
            });
            jobStore.addLog(jobId, 'Voice narration generated.');

            // 4. Generate Images
            jobStore.addLog(jobId, 'Generating images with DALL-E...');
            const imagePaths = [];
            for (let i = 0; i < scenes.length; i++) {
                const imagePath = await OpenAIService.generateImage(scenes[i], jobDir);
                imagePaths.push(imagePath);

                const currentProgress = 25 + Math.floor(((i + 1) / scenes.length) * 35);
                jobStore.update(jobId, {
                    progress: currentProgress,
                    metadata: { ...jobStore.get(jobId)?.metadata, imagePaths }
                });
                jobStore.addLog(jobId, `Image ${i + 1}/${scenes.length} generated.`);
            }

            // 5. Generate Subtitles
            jobStore.addLog(jobId, 'Generating subtitles...');
            const subtitlePath = await FFmpegService.generateSubtitles(scenes, jobDir);
            jobStore.update(jobId, {
                progress: 65,
                metadata: { ...jobStore.get(jobId)?.metadata, subtitlePath }
            });

            // 6. Render Video
            jobStore.addLog(jobId, 'Rendering final video with FFmpeg (this might take a while)...');
            await FFmpegService.generateVideo(
                scenes,
                audioPath,
                subtitlePath,
                jobDir,
                outputPath,
                (progress) => {
                    // Progress from FFmpeg is mapped from 65 to 100
                    jobStore.update(jobId, { progress: Math.floor(progress) });
                }
            );

            // 7. Cleanup & Finish
            jobStore.update(jobId, {
                status: 'completed',
                progress: 100,
                completedAt: new Date(),
                videoPath: outputPath
            });
            jobStore.addLog(jobId, 'Job completed successfully!');

            // Cleanup temporary assets
            await FileManager.cleanupJobFiles(jobId, config.uploadsDir);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            logger.error(`Job ${jobId} failed:`, error);

            jobStore.update(jobId, {
                status: 'failed',
                error: errorMessage
            });
            jobStore.addLog(jobId, `ERROR: ${errorMessage}`);

            // Cleanup on failure too
            await FileManager.cleanupJobFiles(jobId, config.uploadsDir);
        }
    }

    static getJob(jobId: string): Job | undefined {
        return jobStore.get(jobId);
    }

    static getAllJobs(): Job[] {
        return jobStore.getAll();
    }

    static async deleteJob(jobId: string): Promise<void> {
        const job = jobStore.get(jobId);
        if (job?.videoPath) {
            await FileManager.deleteFile(job.videoPath);
        }
        jobStore.delete(jobId);
    }
}
