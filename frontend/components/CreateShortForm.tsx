'use client';

import { useState } from 'react';
import { jobApi } from '@/lib/api';
import { PlusCircle, Loader2, Wand2 } from 'lucide-react';
// import { motion } from 'framer-motion';

import { Job } from '@/lib/types';

interface CreateShortFormProps {
    onJobCreated: (job: Job) => void;
}

export default function CreateShortForm({ onJobCreated }: CreateShortFormProps) {
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setIsLoading(true);
        setError('');

        try {
            const job = await jobApi.create(topic, duration);
            onJobCreated(job);
            setTopic('');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message : 'Failed to start AI generation.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass p-6 rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-accent" />
                    Generate New Short
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            What should the video be about?
                        </label>
                        <textarea
                            placeholder="E.g. The transformation of AI in 2024, or a scary story about a haunted clock..."
                            className="input-field min-h-[100px] py-4 resize-none bg-background/50 border-white/10 focus:border-primary/50"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground uppercase tracking-wider">Target Duration</span>
                            <span className="font-bold text-primary">{duration}s</span>
                        </div>
                        <input
                            type="range"
                            min="45"
                            max="60"
                            step="1"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                            <span>45s</span>
                            <span>52s</span>
                            <span>60s</span>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 font-medium">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !topic}
                        className="btn-primary w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:grayscale"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Initializing AI Pipeline...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Generate YouTube Short
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Decorative gradient background */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors pointer-events-none" />
        </div>
    );
}
