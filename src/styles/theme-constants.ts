/**
 * Centralized theme constants for Yu-Gi-Oh! styling
 * This eliminates redundancy across components
 */

export const themeClasses = {
  // Border styles
  cardFrame:
    "millennium-border bg-gradient-card border border-border rounded-lg transition-all duration-300",
  sectionFrame: "millennium-border bg-gradient-dark p-6 rounded-xl shadow-card",
  emptyState: "millennium-border bg-gradient-dark rounded-xl p-8 text-center",

  // Text styles
  heading: "text-lg font-bold text-secondary",
  subheading: "text-sm font-medium text-secondary",
  description: "text-sm text-muted-foreground",

  // Layout utilities
  gridContainer:
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4",
  flexCenter: "flex items-center justify-center",

  // Animation utilities
  hoverScale:
    "transition-all duration-300 hover:scale-105 hover:-translate-y-2",
  hoverGlow: "transition-all duration-300 hover:shadow-glow",

  // Divider styles
  divider: "hieroglyph-divider w-32 mx-auto my-4",
} as const;

// CSS variables for consistent theming
export const cssVariables = {
  colors: {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    background: "hsl(var(--background))",
    card: "hsl(var(--card))",
    border: "hsl(var(--border))",
  },
  shadows: {
    card: "var(--shadow-card)",
    glow: "var(--shadow-glow)",
    millennium: "var(--shadow-millennium)",
  },
} as const;
