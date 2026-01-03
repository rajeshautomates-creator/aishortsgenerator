'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/lib/types';
import { jobApi } from '@/lib/api';
import {
    CheckCircle2,
    CircleDashed,
    AlertCircle,
    Download,
    Trash2,
    Clock,
    Eye,
    FileText,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface JobCardProps {
    initialJob: Job;
    onDelete: (id: string) => void;
}

export default function JobCard({ initialJob, onDelete }: JobCardProps) {
    const [job, setJob] = useState<Job>(initialJob);
    const [showLogs, setShowLogs] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        let interval: any;

        if (job.status === 'pending' || job.status === 'processing') {
            interval = setInterval(async () => {
                try {
                    const updatedJob = await jobApi.getOne(job.id);
                    setJob(updatedJob);

                    if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Failed to poll job status:', error);
                }
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [job.id, job.status]);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this job and all associated files?')) {
            await jobApi.delete(job.id);
            onDelete(job.id);
        }
    };

    const statusColors = {
        pending: 'text-muted-foreground',
        processing: 'text-primary',
        completed: 'text-green-500',
        failed: 'text-destructive',
    };

    const statusIcons = {
        pending: CircleDashed,
        processing: Loader2,
        completed: CheckCircle2,
        failed: AlertCircle,
    };

    const StatusIcon = statusIcons[job.status as keyof typeof statusIcons];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2">
                            {job.topic}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {job.duration}s
                            </span>
                            <span>•</span>
                            <span>{formatDate(job.createdAt)}</span>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider",
                        job.status === 'completed' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                            job.status === 'failed' ? "bg-destructive/10 border-destructive/20 text-destructive" :
                                "bg-primary/10 border-primary/20 text-primary"
                    )}>
                        <StatusIcon className={cn("w-3 h-3", job.status === 'processing' && "animate-spin")} />
                        {job.status}
                    </div>
                </div>

                {/* Progress Bar */}
                {(job.status === 'processing' || job.status === 'pending') && (
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between items-end text-[10px] font-bold text-muted-foreground uppercase">
                            <span>Artificial Intelligence Processing</span>
                            <span className="text-primary">{job.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${job.progress}%` }}
                                className="h-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            />
                        </div>
                    </div>
                )}

                {job.status === 'completed' && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex-1 h-10 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            {showPreview ? 'Hide Preview' : 'Preview Short'}
                        </button>
                        <a
                            href={jobApi.getDownloadUrl(job.id)}
                            className="flex-1 h-10 px-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>
                    </div>
                )}

                {job.status === 'failed' && (
                    <div className="mt-4 p-3 bg-destructive/10 rounded-xl border border-destructive/20 text-xs text-destructive font-medium">
                        {job.error || 'The generation failed. Check logs for details.'}
                    </div>
                )}

                {/* Accordion Controls */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            <FileText className="w-3 h-3" />
                            Logs & Pipeline
                            {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <AnimatePresence>
                    {showPreview && job.status === 'completed' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4"
                        >
                            <div className="aspect-[9/16] w-full max-w-[280px] mx-auto bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                                <video
                                    src={jobApi.getVideoUrl(`${job.id}.mp4`)}
                                    controls
                                    preload="auto"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>
                    )}

                    {showLogs && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4"
                        >
                            <div className="bg-black/50 rounded-xl p-4 font-mono text-[10px] space-y-1 max-h-48 overflow-y-auto border border-white/5">
                                {job.logs.map((log: string, i: number) => (
                                    <div key={i} className="flex gap-2 opacity-70">
                                        <span className="text-primary shrink-0">[{i + 1}]</span>
                                        <span className="break-all">{log}</span>
                                    </div>
                                ))}
                                {!job.logs.length && (
                                    <p className="italic opacity-50">No logs available for this job.</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
