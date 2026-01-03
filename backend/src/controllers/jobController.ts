import { Request, Response } from 'express';
import { JobService } from '../services/job.service.js';
import logger from '../utils/logger.js';
// import path from 'path';

export class JobController {
    static async createJob(req: Request, res: Response) {
        try {
            const { topic, duration } = req.body;

            if (!topic || !duration) {
                return res.status(400).json({ message: 'Topic and duration are required' });
            }

            const job = await JobService.createJob(topic, parseInt(duration));
            return res.status(201).json(job);
        } catch (error) {
            logger.error('Failed to create job:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getJob(req: Request, res: Response) {
        const { id } = req.params;
        const job = JobService.getJob(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        return res.json(job);
    }

    static async getAllJobs(_req: Request, res: Response) {
        const jobs = JobService.getAllJobs();
        return res.json(jobs);
    }

    static async deleteJob(req: Request, res: Response) {
        const { id } = req.params;
        await JobService.deleteJob(id);
        return res.status(204).send();
    }

    static async downloadVideo(req: Request, res: Response) {
        const { id } = req.params;
        const job = JobService.getJob(id);

        if (!job || !job.videoPath || job.status !== 'completed') {
            return res.status(404).json({ message: 'Video not found or not ready' });
        }

        return res.download(job.videoPath, `short-${id}.mp4`);
    }
}
