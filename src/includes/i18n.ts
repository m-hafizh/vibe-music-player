import { createI18n } from 'vue-i18n'

/**
 * Load locale messages
 *
 * Uses Vite's import.meta.glob to eagerly import all JSON locale files.
 */
function loadLocaleMessages(): Record<string, Record<string, unknown>> {
  const locales: Record<string, { default?: Record<string, unknown> }> =
    import.meta.glob('../locales/*.json', { eager: true })

  const messages: Record<string, Record<string, unknown>> = {}

  Object.entries(locales).forEach(([path, module]) => {
    const matched = path.match(/([A-Za-z0-9-_]+)\.json$/i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = (module.default ?? module) as Record<string, unknown>
    }
  })

  return messages
}

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: (import.meta.env.VITE_I18N_LOCALE as string) || 'en',
  fallbackLocale: (import.meta.env.VITE_I18N_FALLBACK_LOCALE as string) || 'en',
  messages: loadLocaleMessages(),
  numberFormats: {
    en: {
      currency: { style: 'currency', currency: 'USD' },
    },
    ja: {
      currency: { style: 'currency', currency: 'JPY' },
    },
  },
})
