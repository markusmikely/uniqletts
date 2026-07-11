import { buildLegacyTheme } from 'sanity'

/**
 * Studio theme mapped to the front-end design tokens in
 * src/styles/globals.css — brand blues, orange accent, charcoal text.
 */
export const uniqlettsTheme = buildLegacyTheme({
  /* Base */
  '--black': '#2e3640',        // --color-charcoal
  '--white': '#ffffff',

  '--gray': '#6b7685',         // --color-gray-600
  '--gray-base': '#6b7685',

  '--component-bg': '#ffffff',
  '--component-text-color': '#2e3640',

  /* Brand */
  '--brand-primary': '#086fb8', // --color-primary

  /* Buttons */
  '--default-button-color': '#6b7685',
  '--default-button-primary-color': '#086fb8',
  '--default-button-success-color': '#0f9d58',
  '--default-button-warning-color': '#e8833a', // --color-accent
  '--default-button-danger-color': '#db4437',

  /* States */
  '--state-info-color': '#086fb8',
  '--state-success-color': '#0f9d58',
  '--state-warning-color': '#e8833a',
  '--state-danger-color': '#db4437',

  /* Navbar */
  '--main-navigation-color': '#2e3640',
  '--main-navigation-color--inverted': '#ffffff',

  '--focus-color': '#086fb8',
})
