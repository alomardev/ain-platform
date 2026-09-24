import { Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '../theme';

export default function EditDeleteActions({ onEdit, onDelete }) {
  const { theme } = useTheme();
  return (
    <>
      <button
        onClick={onEdit}
        className={`ain-accent-hover flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${theme.border} ${theme.textSecondary}`}
      >
        <Pencil className="h-3.5 w-3.5" /> تعديل
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" /> حذف
      </button>
    </>
  );
}
