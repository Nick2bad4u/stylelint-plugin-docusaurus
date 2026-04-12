/**
 * @remarks
 * The previous template used a much more specialized sidebar enhancer that was
 * tightly coupled to the old rule-doc taxonomy. The new Stylelint template
 * keeps this module intentionally small until the new docs IA settles.
 *
 * @packageDocumentation
 * Lightweight client-side enhancement bootstrap for the docs site.
 */

type InitializeAdvancedFeatures = () => void;

declare global {
    interface Window {
        initializeAdvancedFeatures?: InitializeAdvancedFeatures;
    }
}

/** Initialize client-side enhancements after hydration. */
export const initializeAdvancedFeatures: InitializeAdvancedFeatures = () => {
    // Intentionally minimal for the Stylelint template bootstrap phase.
};

if (typeof window !== "undefined") {
    window.initializeAdvancedFeatures = initializeAdvancedFeatures;
    queueMicrotask(() => {
        initializeAdvancedFeatures();
    });
}

export {};
