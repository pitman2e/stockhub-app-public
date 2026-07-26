// quickSearchUtils.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import QuickSearchUtils from "../utils/quickSearchUtils";

describe('QuickSearchUtils', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('isQuickSearchFocused', () => {
    it('returns false when quickSearchElement is null or undefined', () => {
      expect(QuickSearchUtils.isQuickSearchFocused(null)).toBe(false);
      expect(QuickSearchUtils.isQuickSearchFocused(undefined)).toBe(false);
    });

    it('returns false when document.activeElement is not the search element or its child', () => {
      const searchInput = document.createElement('input');
      const otherButton = document.createElement('button');
      document.body.appendChild(searchInput);
      document.body.appendChild(otherButton);

      otherButton.focus();

      expect(QuickSearchUtils.isQuickSearchFocused(searchInput)).toBe(false);
    });

    it('returns true when document.activeElement is directly the quick search element', () => {
      const searchInput = document.createElement('input');
      document.body.appendChild(searchInput);

      searchInput.focus();

      expect(QuickSearchUtils.isQuickSearchFocused(searchInput)).toBe(true);
    });

    it('returns true when document.activeElement is nested inside the quick search element container', () => {
      const wrapper = document.createElement('div');
      const childInput = document.createElement('input');
      wrapper.appendChild(childInput);
      document.body.appendChild(wrapper);

      childInput.focus();

      expect(QuickSearchUtils.isQuickSearchFocused(wrapper)).toBe(true);
    });
  });

  describe('shouldBlurQuickSearch', () => {
    it('returns true when "/" is pressed without modifiers and quick search is focused and empty', () => {
      const searchInput = document.createElement('input');
      searchInput.value = '';
      document.body.appendChild(searchInput);
      searchInput.focus();

      const event = { key: '/', ctrlKey: false, metaKey: false, altKey: false };

      expect(QuickSearchUtils.shouldBlurQuickSearch(event, searchInput)).toBe(true);
    });

    it('returns false when quick search input text is not empty', () => {
      const searchInput = document.createElement('input');
      searchInput.value = 'AAPL';
      document.body.appendChild(searchInput);
      searchInput.focus();

      const event = { key: '/', ctrlKey: false, metaKey: false, altKey: false };

      expect(QuickSearchUtils.shouldBlurQuickSearch(event, searchInput)).toBe(false);
    });

    it('returns false when quick search input inside a wrapper container is not empty', () => {
      const wrapper = document.createElement('div');
      const childInput = document.createElement('input');
      childInput.value = 'NVDA';
      wrapper.appendChild(childInput);
      document.body.appendChild(wrapper);

      childInput.focus();

      const event = { key: '/', ctrlKey: false, metaKey: false, altKey: false };

      expect(QuickSearchUtils.shouldBlurQuickSearch(event, wrapper)).toBe(false);
    });

    it('returns false when the pressed key is not "/"', () => {
      const searchInput = document.createElement('input');
      document.body.appendChild(searchInput);
      searchInput.focus();

      const event = { key: 'a', ctrlKey: false, metaKey: false, altKey: false };

      expect(QuickSearchUtils.shouldBlurQuickSearch(event, searchInput)).toBe(false);
    });

    it('returns false when modifier keys (Ctrl, Cmd, Alt) are pressed with "/"', () => {
      const searchInput = document.createElement('input');
      document.body.appendChild(searchInput);
      searchInput.focus();

      expect(
        QuickSearchUtils.shouldBlurQuickSearch(
          { key: '/', ctrlKey: true, metaKey: false, altKey: false },
          searchInput,
        ),
      ).toBe(false);

      expect(
        QuickSearchUtils.shouldBlurQuickSearch(
          { key: '/', ctrlKey: false, metaKey: true, altKey: false },
          searchInput,
        ),
      ).toBe(false);

      expect(
        QuickSearchUtils.shouldBlurQuickSearch(
          { key: '/', ctrlKey: false, metaKey: false, altKey: true },
          searchInput,
        ),
      ).toBe(false);
    });

    it('returns false when quick search is not focused', () => {
      const searchInput = document.createElement('input');
      const otherButton = document.createElement('button');
      document.body.appendChild(searchInput);
      document.body.appendChild(otherButton);
      otherButton.focus();

      const event = { key: '/', ctrlKey: false, metaKey: false, altKey: false };

      expect(QuickSearchUtils.shouldBlurQuickSearch(event, searchInput)).toBe(false);
    });
  });

  describe('shouldHandleQuickSearchKey', () => {
    it('captures slash when focus is not on an editable field', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      const event = {
        key: '/',
        target: button,
        defaultPrevented: false,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      } as unknown as KeyboardEvent;

      expect(QuickSearchUtils.shouldHandleQuickSearchKey(event)).toBe(true);
    });

    it('lets the browser handle slash when focus is already in an editable field', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = {
        key: '/',
        target: input,
        defaultPrevented: false,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      } as unknown as KeyboardEvent;

      expect(QuickSearchUtils.shouldHandleQuickSearchKey(event, null)).toBe(false);
    });

    it('lets the browser handle slash when the Quick Search field itself is active', () => {
      const searchInput = document.createElement('input');
      document.body.appendChild(searchInput);
      searchInput.focus();

      const event = {
        key: '/',
        target: searchInput,
        defaultPrevented: false,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      } as unknown as KeyboardEvent;

      expect(QuickSearchUtils.shouldHandleQuickSearchKey(event, searchInput)).toBe(false);
    });
  });
});