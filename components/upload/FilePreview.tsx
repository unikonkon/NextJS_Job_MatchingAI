import { FileText, X } from "lucide-react";

interface FilePreviewProps {
    file: File;
    onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
    return (
        <div className="relative flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
                <h4 className="font-medium text-zinc-900 dark:text-white">{file.name}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
            </div>
            <button
                onClick={onRemove}
                className="absolute right-2 top-2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
