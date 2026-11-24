/**
 * Sticky top for panel `i` in the projects deck, in px (just under the sticky
 * filter bar). Each panel peeks a little below the one before it.
 */
export const deckTop = (i: number, wide: boolean) => (wide ? 152 + i * 14 : 140 + i * 8);
