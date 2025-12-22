import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    title?: string;
    description?: string;
    warningMessage?: string;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false,
    title = "ยืนยันการลบ",
    description = "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?",
    warningMessage = "การลบข้อมูลนี้จะทำให้ข้อมูลโปรไฟล์และผลการแมตช์งานถูกลบออกจากระบบทั้งหมด และไม่สามารถกู้คืนได้",
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                        </div>
                    </div>
                    {warningMessage && (
                        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                            {warningMessage}
                        </p>
                    )}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                            {isDeleting ? "กำลังลบ..." : "ลบข้อมูล"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

