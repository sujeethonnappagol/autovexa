import { describe, it, expect } from 'vitest';
import { findAnswer, KNOWLEDGE, SUGGESTIONS } from '../chatKnowledge';

/**
 * Strategy: pure-function tests — no DOM, fast, deterministic.
 * Cover happy path, fallback, and edge cases for the FAQ matcher.
 */
describe('findAnswer (VexaBot knowledge)', () => {
  it('returns a greeting for hello/hi', () => {
    const answer = findAnswer('Hello there');
    expect(answer).toMatch(/VexaBot|AutoVexa|assistant/i);
  });

  it('explains how to book a car', () => {
    const answer = findAnswer('How do I book a car?');
    expect(answer.toLowerCase()).toMatch(/book/);
    expect(answer.toLowerCase()).toMatch(/vehicle|login|sign/);
  });

  it('returns demo credentials when asked', () => {
    const answer = findAnswer('demo credentials');
    expect(answer).toMatch(/sujeet@example\.com|admin@autovexa\.com|vendor/i);
  });

  it('mentions filters for search-related questions', () => {
    const answer = findAnswer('How do filters work?');
    expect(answer.toLowerCase()).toMatch(/filter|brand|sort/);
  });

  it('falls back with guidance for unknown topics', () => {
    const answer = findAnswer('What is the weather in Mars?');
    expect(answer.toLowerCase()).toMatch(/only help|autovexa|try/i);
  });

  it('handles empty and whitespace input', () => {
    expect(findAnswer('')).toBeNull();
    expect(findAnswer('   ')).toBeNull();
  });

  it('is case-insensitive', () => {
    const a = findAnswer('LOGIN please');
    const b = findAnswer('login please');
    expect(a).toBe(b);
  });

  it('prefers longer keyword matches (scoring)', () => {
    // "how to book" should beat a generic single word if present
    const answer = findAnswer('how to book a vehicle');
    expect(answer.toLowerCase()).toMatch(/book/);
  });
});

describe('knowledge base shape', () => {
  it('has about 20 topic entries', () => {
    expect(KNOWLEDGE.length).toBeGreaterThanOrEqual(15);
    expect(KNOWLEDGE.length).toBeLessThanOrEqual(25);
  });

  it('each entry has keys and answer', () => {
    for (const item of KNOWLEDGE) {
      expect(Array.isArray(item.keys)).toBe(true);
      expect(item.keys.length).toBeGreaterThan(0);
      expect(typeof item.answer).toBe('string');
      expect(item.answer.length).toBeGreaterThan(10);
    }
  });

  it('exposes quick suggestions', () => {
    expect(SUGGESTIONS.length).toBeGreaterThanOrEqual(3);
  });
});
