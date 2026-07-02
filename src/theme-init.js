// Applique le thème sauvegardé AVANT le premier paint (évite le flash de couleur).
// Externalisé de index.html pour permettre une CSP stricte (script-src 'self', sans
// 'unsafe-inline'). Script classique et bloquant dans <head> → s'exécute avant le rendu.
try {
	if (localStorage.getItem('memoforge.theme') === 'light')
		document.documentElement.classList.add('theme-light');
} catch { /* localStorage indisponible : on garde le thème par défaut */ }
