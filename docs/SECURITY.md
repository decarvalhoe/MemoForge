# Sécurité (site statique)

**🌐 Français** — MemoForge est un site **statique**, sans backend ni dépendance runtime
(0 npm en production). La surface d'attaque est minimale ; ce document décrit le durcissement
appliqué (E10-5, #166) et ce qui relève de la couche serveur/CDN.

## Content-Security-Policy (stricte, active)

Déclarée via `<meta http-equiv>` dans `index.html`, **sans `'unsafe-inline'`** — les styles
et le script de pré-peinture du thème sont externalisés (voir #163 et `src/theme-init.js`).

```
default-src 'self';
script-src  'self';
style-src   'self' https://fonts.googleapis.com;
font-src    'self' https://fonts.gstatic.com;
img-src     'self' data:;
connect-src 'self';
object-src  'none';
base-uri    'self';
form-action 'self';
frame-ancestors 'none'
```

- **`object-src 'none'` / `frame-ancestors 'none'`** : ni plugins, ni embarquement en iframe
  (anti-clickjacking).
- **`img-src … data:`** : autorise le favicon SVG en data-URI (seul usage de `data:`).
- **Vérifiée en CI** : le harnais (`npm run test:visual`) écoute
  `securitypolicyviolation` sur la carte et une salle et **échoue s'il y a la moindre
  violation** — les 9 écrans sont par ailleurs rendus **CSP active** (0 régression visuelle).

### Exception documentée : Google Fonts

Seule ressource tierce : les webfonts **VT323** et **IBM Plex Mono**
(`fonts.googleapis.com` + `fonts.gstatic.com`). Choix assumé : les self-héberger dépasserait
le budget de poids (280 KB) actuellement à ~254 KB. Pour éliminer complètement le tiers,
déposer les binaires `woff2` dans `assets/fonts/`, basculer les `src` de
`styles/tokens/fonts.css` en local, puis réduire la CSP à `style-src 'self'; font-src 'self'`.

## En-têtes HTTP (couche serveur/CDN)

Certaines protections ne peuvent **pas** être posées via `<meta>` et doivent l'être en
en-tête de réponse. GitHub Pages ne permet pas d'en-têtes personnalisés ; ces valeurs sont à
appliquer si le site passe derrière un CDN/reverse-proxy configurable :

| En-tête | Valeur recommandée | Rôle |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | empêche le MIME-sniffing |
| `Referrer-Policy` | `no-referrer` | déjà posé aussi via `<meta name="referrer">` |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=()` | coupe les API non utilisées |
| `Strict-Transport-Security` | `max-age=63072000` | force HTTPS (déjà fourni par Pages) |

## Rappels

- **0 dépendance runtime**, **0 script tiers**, **0 appel réseau** hors webfonts.
- Les données joueur (progression, stats, thème, langue) restent en `localStorage` — **jamais
  envoyées** (voir la garde de confidentialité des stats, E9-4).
