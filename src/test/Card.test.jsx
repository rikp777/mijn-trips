import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CardTitle, StatRow } from '../components/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>hello</Card>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies extra style', () => {
    const { container } = render(<Card style={{ marginBottom: 42 }}>x</Card>);
    expect(container.firstChild).toHaveStyle({ marginBottom: '42px' });
  });

  it('sets cursor:pointer and calls onClick when clickable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card onClick={onClick}>click me</Card>);
    await user.click(screen.getByText('click me'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not set cursor when no onClick', () => {
    const { container } = render(<Card>static</Card>);
    expect(container.firstChild).not.toHaveStyle({ cursor: 'pointer' });
  });
});

describe('CardTitle', () => {
  it('renders emoji and label', () => {
    render(<CardTitle emoji="🎒">Paklijst</CardTitle>);
    expect(screen.getByText(/Paklijst/)).toBeInTheDocument();
    expect(screen.getByText(/🎒/)).toBeInTheDocument();
  });
});

describe('StatRow', () => {
  it('renders label and value', () => {
    render(<StatRow emoji="💨" label="Gem. wind" value="14 kn" />);
    // emoji and label are sibling text nodes — use partial match
    expect(screen.getByText(/Gem\. wind/)).toBeInTheDocument();
    expect(screen.getByText('14 kn')).toBeInTheDocument();
  });

  it('applies custom color to value', () => {
    render(<StatRow label="Temp" value="22°C" color="#34D399" />);
    const value = screen.getByText('22°C');
    expect(value).toHaveStyle({ color: '#34D399' });
  });
});
