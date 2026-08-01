/**
 * Setup for the `unit` Vitest project (jsdom).
 * Registers jest-dom matchers and unmounts rendered components between
 * tests so each one starts from a clean document.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
