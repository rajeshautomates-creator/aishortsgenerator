'use client';

import { useAuth } from '@/components/AuthProvider';
import { Youtube, LogOut, Video } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
// import { motion } from 'framer-motion';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAdmin, logout } = useAuth();
    const pathname = usePathname();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Will be redirected by AuthProvider
    }

    const navItems = [
        { label: 'Shorts', icon: Youtube, href: '/dashboard' },
        { label: 'Archive', icon: Video, href: '/dashboard/archive' }, // Placeholder for future
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-r border-border bg-card/50 flex flex-col">
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                        <Youtube className="w-8 h-8 text-primary" />
                        <span>AI Shorts</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted",
                                pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
