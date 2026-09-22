interface SuggestedChipsProps {
  onChipClick: (question: string) => void;
  disabled?: boolean;
}

const suggestions = [
  { label: '🕐 Check-in time', question: 'What time is check-in?' },
  { label: '🏊 Pool', question: 'Does the hotel have a pool?' },
  { label: '👨‍👩‍👧 3 Guests', question: 'Best room for 3 guests?' },
  { label: '🥗 Veg Options', question: 'Show vegetarian options' },
];

export function SuggestedChips({ onChipClick, disabled = false }: SuggestedChipsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onChipClick(s.question)}
          disabled={disabled}
          className="min-h-9 rounded-lg border border-[#eadfce] bg-white px-2.5 py-2 text-xs font-medium leading-tight text-[#4a1c1c] shadow-sm hover:border-[#b8860b] hover:bg-[#fffaf0] hover:text-[#602323] disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:ring-offset-1 sm:min-h-0 sm:rounded-full sm:px-3 sm:py-1.5"
          aria-label={`Ask: ${s.question}`}
        >
          <span className="block truncate">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
