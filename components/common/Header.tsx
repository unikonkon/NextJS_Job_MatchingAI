"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Briefcase, Menu, X } from "lucide-react";

export function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/history", label: "History", icon: History },
        { href: "/jobs", label: "All Jobs", icon: Briefcase },
    ];

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl shadow-sm dark:border-zinc-800/80 dark:bg-black/90 dark:shadow-zinc-900/50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-xl font-bold tracking-tight transition-all hover:scale-105"
                    >
                        <span className="bg-linear-to-b from-blue-600 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
                            JobMatch
                        </span>
                        <span className="text-zinc-900 dark:text-white">AI</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/50 dark:text-blue-400"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                                    }
                                `}
                            >
                                <Icon className={`h-4 w-4 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="w-8 h-8 text-white" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Mobile Menu */}
                    <nav className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-b border-zinc-200 dark:bg-black/95 dark:border-zinc-800 shadow-lg transition-all duration-300 ease-out">
                        <div className="container mx-auto px-4 py-4 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            group flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200
                                            ${isActive
                                                ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/50 dark:text-blue-400"
                                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                                            }
                                        `}
                                    >
                                        <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <span className="ml-auto h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </>
            )}
        </header>
    );
}
