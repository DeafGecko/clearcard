import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

beforeAll(() => {
  // jsdom does not implement matchMedia; the app does not need it, but keep the environment stable.
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
    })) as unknown as typeof window.matchMedia;
  }
});

describe('App: first run', () => {
  it('shows the brand and the built-in cards', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'ShowCard' })).toBeInTheDocument();
    expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
  });

  it('shows emergency cards in the Emergency category', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Emergency' }));
    expect(screen.getByText('Emergency Alert')).toBeInTheDocument();
  });

  it('keeps the Vault private card hidden until unlocked', () => {
    render(<App />);
    expect(screen.queryByText('Personal ID')).not.toBeInTheDocument();
  });

  it('filters cards when a category is chosen', () => {
    render(<App />);
    const nav = screen.getByRole('navigation');
    fireEvent.click(within(nav).getByRole('button', { name: 'Services' }));
    expect(screen.getByText('Oil Change Request')).toBeInTheDocument();
    expect(screen.queryByText('Doctor Appointment')).not.toBeInTheDocument();
  });

  it('opens a card in the full-screen viewer', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Doctor Appointment'));
    expect(screen.getAllByText(/I have an appointment/).length).toBeGreaterThan(0);
  });
});

describe('App: robustness', () => {
  it('still renders when saved cards are corrupt', () => {
    localStorage.setItem('visio_cards', '[{broken');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'ShowCard' })).toBeInTheDocument();
  });
});
