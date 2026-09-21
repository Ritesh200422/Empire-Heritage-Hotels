import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingIndicator } from '@/components/TypingIndicator';

describe('TypingIndicator', () => {
  it('renders with aria label', () => {
    render(<TypingIndicator />);
    expect(screen.getByLabelText('Assistant is typing')).toBeInTheDocument();
  });

  it('renders three bounce dots', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });
});
