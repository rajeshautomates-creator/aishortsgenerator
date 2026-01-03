import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import logger from './logger.js';

export class FileManager {
    static async ensureDir(dirPath: string): Promise<void> {
        if (!existsSync(dirPath)) {
            await fs.mkdir(dirPath, { recursive: true });
            logger.debug(`Created directory: ${dirPath}`);
        }
    }

    static async deleteFile(filePath: string): Promise<void> {
        try {
            if (existsSync(filePath)) {
                await fs.unlink(filePath);
                logger.debug(`Deleted file: ${filePath}`);
            }
        } catch (error) {
            logger.error(`Failed to delete file ${filePath}:`, error);
        }
    }

    static async deleteDirectory(dirPath: string): Promise<void> {
        try {
            if (existsSync(dirPath)) {
                await fs.rm(dirPath, { recursive: true, force: true });
                logger.debug(`Deleted directory: ${dirPath}`);
            }
        } catch (error) {
            logger.error(`Failed to delete directory ${dirPath}:`, error);
        }
    }

    static async cleanupJobFiles(jobId: string, uploadsDir: string): Promise<void> {
        const jobDir = path.join(uploadsDir, jobId);
        await this.deleteDirectory(jobDir);
    }

    static getJobDir(jobId: string, uploadsDir: string): string {
        return path.join(uploadsDir, jobId);
    }

    static getOutputPath(jobId: string, outputsDir: string): string {
        return path.join(outputsDir, `${jobId}.mp4`);
    }
}
