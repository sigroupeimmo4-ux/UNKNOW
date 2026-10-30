/* Le catalogue existant reste la seule source de matières : aucune liste inventée. */
window.studybeamCatalogue = (async () => {
  const response = await fetch('./curriculum/catalogue.json',{signal:AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error('Catalogue indisponible');
  const data = await response.json();
  if (data.school_year !== '2026-2027' || !Array.isArray(data.scopes) || !data.scopes.length || !Array.isArray(data.programs) || !Array.isArray(data.contents)) throw new Error('Catalogue invalide');
  return data;
})();
