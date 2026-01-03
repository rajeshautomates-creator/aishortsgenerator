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
    createdAt: string;
    completedAt?: string;
    videoPath?: string;
    error?: string;
    logs: string[];
    metadata?: JobMetadata;
}
