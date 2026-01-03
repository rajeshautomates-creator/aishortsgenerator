'use client';

import { useState, useEffect } from 'react';
import CreateShortForm from '@/components/CreateShortForm';
import JobCard from '@/components/JobCard';
import { jobApi } from '@/lib/api';
import { Job } from '@/lib/types';
import { Loader2, Video, Inbox, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await jobApi.getAll();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJobCreated = (newJob: Job) => {
        setJobs([newJob, ...jobs]);
    };

    const handleJobDeleted = (id: string) => {
        setJobs(jobs.filter(job => job.id !== id));
    };

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">SaaS Console</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">
                        Video Engine
                    </h1>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="sticky top-8">
                        <CreateShortForm onJobCreated={handleJobCreated} />
                    </div>
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Video className="w-5 h-5 text-muted-foreground" />
                            Active Generation Pipeline
                        </h2>
                        <div className="bg-muted px-2 py-1 rounded text-[10px] font-bold text-muted-foreground">
                            {jobs.length} TOTAL
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-3xl border border-dashed border-border/50">
                            <Loader2 className="w-10 h-10 animate-spin text-primary/50 mb-4" />
                            <p className="text-muted-foreground font-medium">Syncing with server...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-card/30 rounded-3xl border border-dashed border-border/50 text-center px-6">
                            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                                <Inbox className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Your generation pipeline is currently empty. Use the form on the left to start creating AI-powered YouTube Shorts.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {jobs.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        initialJob={job}
                                        onDelete={handleJobDeleted}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
