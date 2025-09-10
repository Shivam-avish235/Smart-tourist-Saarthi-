// translations.js - Manages translations for the application
export class TranslationManager {
    constructor() {
        this.translations = {};
        this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    }

    async loadTranslations(language) {
        try {
            const response = await fetch(`/translations/${language}.json`);
            if (!response.ok) throw new Error(`Failed to load ${language} translations`);
            this.translations[language] = await response.json();
            return true;
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);
            return false;
        }
    }

    translate(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || key;
        return translation.replace(/\${(\w+)}/g, (_, param) => params[param] || '');
    }

    async changeLanguage(language) {
        if (!this.translations[language]) {
            const loaded = await this.loadTranslations(language);
            if (!loaded) return false;
        }
        this.currentLanguage = language;
        localStorage.setItem('preferredLanguage', language);
        document.documentElement.lang = language;
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
        return true;
    }

    getDirection(language = this.currentLanguage) {
        return ['ar', 'ur', 'he', 'fa'].includes(language) ? 'rtl' : 'ltr';
    }
}
