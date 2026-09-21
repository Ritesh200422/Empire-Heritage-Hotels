interface SuggestedChipsProps {
  onChipClick: (question: string) => void;
}

const suggestions = [
  { label: '🕐 Check-in time', question: 'What time is check-in?' },
  { label: '🏊 Pool', question: 'Does the hotel have a pool?' },
  { label: '👨‍👩‍👧 3 Guests', question: 'Best room for 3 guests?' },
  { label: '🥗 Veg Options', question: 'Show vegetarian options' },
];

export function SuggestedChips({ onChipClick }: SuggestedChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onChipClick(s.question)}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Ask: ${s.question}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
