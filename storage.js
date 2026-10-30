/* Préférences locales : pas de suppression ni de migration automatique des données existantes. */
(() => {
  const memory = new Map();
  function unavailable() {
    const status = document.getElementById('storageStatus');
    if (status) {status.hidden = false; status.textContent = 'Le stockage de ce navigateur est indisponible. Les changements de cette session ne seront pas conservés après fermeture.';}
  }
  window.studybeamStorage = {
    get(key) {try {return memory.has(key) ? memory.get(key) : localStorage.getItem(key);} catch {unavailable();return memory.get(key) ?? null;}},
    set(key,value) {try {localStorage.setItem(key,String(value));memory.delete(key);} catch {memory.set(key,String(value));unavailable();}},
    remove(key) {try {localStorage.removeItem(key);memory.delete(key);} catch {memory.set(key,null);unavailable();}},
    json(key) {try {const value = JSON.parse(this.get(key));return value && typeof value==='object' && !Array.isArray(value) ? value : null;} catch {return null;}}
  };
})();
