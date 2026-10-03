import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import Avatar from './Avatar';
import { useTheme } from '../theme';
import { resizeToSquare } from '../imageResize';

const MAX_INPUT_BYTES = 25 * 1024 * 1024;

// Picks and previews a photo locally; nothing is uploaded until the form is saved.
// value: { blob, preview, removed }  — blob is the resized JPEG to upload, removed means "delete on save".
export default function AvatarUpload({ currentPhoto, gender, value, onChange, onBusyChange }) {
  const { theme, accent } = useTheme();
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  // Free the object URL of a preview once it is replaced or the form closes.
  useEffect(() => () => value.preview && URL.revokeObjectURL(value.preview), [value.preview]);

  const shown = value.preview ?? (value.removed ? null : currentPhoto);

  const pick = async (file) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) return setError('الملف المختار ليس صورة');
    if (file.size > MAX_INPUT_BYTES) return setError('حجم الصورة كبير جداً (الحد 25 ميجابايت)');
    setProcessing(true);
    onBusyChange?.(true);
    try {
      const blob = await resizeToSquare(file);
      onChange({ blob, preview: URL.createObjectURL(blob), removed: false });
    } catch {
      setError('تعذرت قراءة الصورة، جرّب صورة بصيغة JPG أو PNG');
    } finally {
      setProcessing(false);
      onBusyChange?.(false);
    }
  };

  const remove = () => {
    setError('');
    onChange({ blob: null, preview: null, removed: Boolean(currentPhoto) });
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
        aria-label={shown ? 'تغيير الصورة الشخصية' : 'رفع صورة شخصية'}
        className="relative h-24 w-24 shrink-0 rounded-full"
        style={dragging ? { outline: `2px dashed ${accent}`, outlineOffset: 4 } : undefined}
      >
        <Avatar photo={shown} gender={gender} className="h-24 w-24" iconClassName="h-10 w-10" />
        {processing && (
          <span className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </span>
        )}
        <span className="absolute bottom-0 left-0 h-8 w-8 rounded-full ain-accent-solid flex items-center justify-center border-2"
          style={{ borderColor: theme.card }}>
          <Camera className="h-4 w-4" />
        </span>
      </button>

      <div className="min-w-0">
        <p className={`text-sm font-semibold ${theme.textPrimary}`}>
          الصورة الشخصية <span className={`text-xs font-normal ${theme.textMuted}`}>(اختياري)</span>
        </p>
        <p className={`text-xs mt-0.5 ${theme.textMuted}`}>اسحب صورة هنا أو اختر ملفاً — يتم تصغيرها تلقائياً</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <button type="button" disabled={processing} onClick={() => inputRef.current?.click()}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-60 ${theme.border} ${theme.textPrimary} ${theme.hover}`}>
            <Upload className="h-3.5 w-3.5" /> {shown ? 'تغيير' : 'رفع صورة'}
          </button>
          {shown && (
            <button type="button" disabled={processing} onClick={remove}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors text-red-500 disabled:opacity-60 ${theme.border} ${theme.hover}`}>
              <Trash2 className="h-3.5 w-3.5" /> إزالة
            </button>
          )}
        </div>
        {error && <p role="alert" className="text-xs text-red-500 mt-1.5">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = ''; // allow re-picking the same file
        }}
      />
    </div>
  );
}
