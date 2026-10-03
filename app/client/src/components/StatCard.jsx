import { useTheme } from '../theme';

export default function StatCard({ icon: Icon, label, value, suffix, compact = false }) {
  const { theme, dark } = useTheme();
  return (
    <div
      className={`rounded-2xl border ${theme.cardBorder} ${compact ? 'p-3.5' : 'p-4'} flex items-center gap-3`}
      style={{ backgroundColor: theme.card }}
    >
      <div className="h-10 w-10 rounded-xl ain-accent-bg-soft flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className={`${compact ? 'text-lg break-words' : 'text-xl truncate'} font-extrabold ${theme.textPrimary}`}>
          {value}
          {suffix && <span className={`text-xs font-medium mr-1 ${theme.textSecondary}`}>{suffix}</span>}
        </p>
        <p className={`text-xs ${compact ? 'break-words' : 'truncate'} ${theme.textSecondary}`}>{label}</p>
      </div>
    </div>
  );
}
