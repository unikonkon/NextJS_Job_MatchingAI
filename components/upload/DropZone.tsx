"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
    onFileSelect: (file: File) => void;
    isUploading?: boolean;
}

export function DropZone({ onFileSelect, isUploading = false }: DropZoneProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
        disabled: isUploading,
    });

    return (
        <div className="w-full max-w-xl">
            <div
                {...getRootProps()}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-200 ease-in-out cursor-pointer",
                    isDragActive
                        ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20"
                        : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900",
                    isUploading && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {isDragActive ? "Drop your resume here" : "Upload your resume"}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Drag & drop or click to browse (PDF, PNG, JPG max 10MB)
                    </p>
                </div>
            </div>

            {fileRejections.length > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                        {fileRejections[0].errors[0].message}
                    </span>
                </div>
            )}
        </div>
    );
}
