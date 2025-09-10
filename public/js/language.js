async function changeLanguage(lang) {
    const translationManager = new TranslationManager();
    const success = await translationManager.changeLanguage(lang);
    
    if (success) {
      this.currentLanguage = lang;
      document.documentElement.dir = translationManager.getDirection(lang);
      
      // Update all translatable elements
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        element.textContent = translationManager.translate(key);
      });

      // Update placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        element.placeholder = translationManager.translate(key);
      });

      // Update UI direction based on language
      document.body.classList.remove('rtl', 'ltr');
      document.body.classList.add(translationManager.getDirection(lang));
      
      this.showNotification(`Language changed to ${this.availableLanguages.find(l => l.code === lang)?.name || lang}`);
    } else {
      this.showNotification('Failed to change language', 'error');
    }
}
