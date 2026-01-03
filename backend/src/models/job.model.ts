export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Scene {
    index: number;
    text: string;
    imagePrompt: string;
    duration: number;
    imagePath?: string;
}

export interface JobMetadata {
    script?: string;
    scenes?: Scene[];
    audioPath?: string;
    imagePaths?: string[];
    subtitlePath?: string;
}

export interface Job {
    id: string;
    topic: string;
    duration: number;
    status: JobStatus;
    progress: number;
    createdAt: Date;
    completedAt?: Date;
    videoPath?: string;
    error?: string;
    logs: string[];
    metadata?: JobMetadata;
}

class JobStore {
    private jobs: Map<string, Job> = new Map();

    create(job: Job): void {
        this.jobs.set(job.id, job);
    }

    get(id: string): Job | undefined {
        return this.jobs.get(id);
    }

    getAll(): Job[] {
        return Array.from(this.jobs.values()).sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
    }

    update(id: string, updates: Partial<Job>): void {
        const job = this.jobs.get(id);
        if (job) {
            this.jobs.set(id, { ...job, ...updates });
        }
    }

    delete(id: string): void {
        this.jobs.delete(id);
    }

    addLog(id: string, log: string): void {
        const job = this.jobs.get(id);
        if (job) {
            job.logs.push(`[${new Date().toISOString()}] ${log}`);
        }
    }
}

export const jobStore = new JobStore();
