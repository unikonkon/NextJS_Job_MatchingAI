import Link from "next/link";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-blue-600 dark:text-blue-400">
                        JobMatch<span className="text-black dark:text-white">AI</span>
                    </Link>
                </div>
                <nav className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white">
                        Home
                    </Link>
                    <a href="#" className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white">
                        How it works
                    </a>
                </nav>
            </div>
        </header>
    );
}
