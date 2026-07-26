export default class QuickSearchUtils {
  static isEditableElement(target: EventTarget | null): boolean {
    const element = target as Partial<HTMLElement> | null;
    if (!element || typeof element.tagName !== "string") {
      return false;
    }

    const tagName = element.tagName.toUpperCase();
    return (
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT" ||
      !!element.isContentEditable ||
      !!element.closest?.('[contenteditable="true"]')
    );
  }

  static shouldBlurQuickSearch(
    event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>,
    quickSearchElement?: HTMLElement | null,
  ): boolean {
    if (
      event.key !== "/" ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return false;
    }

    if (!this.isQuickSearchFocused(quickSearchElement)) {
      return false;
    }

    // Resolve active input element (direct element or nested inside wrapper)
    const activeElement = typeof document !== "undefined" ? document.activeElement : null;
    const inputElement =
      activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement
        ? activeElement
        : quickSearchElement instanceof HTMLInputElement || quickSearchElement instanceof HTMLTextAreaElement
        ? quickSearchElement
        : quickSearchElement?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');

    // Do not blur if the user has already typed text into the field
    if (inputElement && inputElement.value !== '') {
      return false;
    }

    return true;
  }

  static isQuickSearchFocused(quickSearchElement?: HTMLElement | null): boolean {
  if (!quickSearchElement || typeof document === "undefined" || !document.activeElement) {
    return false;
  }

  const activeElement = document.activeElement;
  return (
    activeElement === quickSearchElement ||
    quickSearchElement.contains(activeElement)
  );
}

  static shouldHandleQuickSearchKey(
    event: Pick<KeyboardEvent, 'key' | 'target' | 'defaultPrevented' | 'ctrlKey' | 'metaKey' | 'altKey'>,
    quickSearchElement?: HTMLElement | null,
  ): boolean {
    if (
      event.key !== "/" ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return false;
    }

    const target = event.target as Node | null;
    const activeElement = typeof document !== "undefined" ? document.activeElement : null;

    if (this.isEditableElement(target)) {
      return false;
    }

    if (
      quickSearchElement && (
        activeElement === quickSearchElement ||
        //Verifies whether the keystroke originated from an element located inside or nested within the quickSearchElement DOM hierarchy,
        //while ensuring type safety against non-node event targets
        (target instanceof Node && quickSearchElement.contains(target))
      )
    ) {
      return false;
    }

    return true;
  }
}