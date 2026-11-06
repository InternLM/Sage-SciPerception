# README animations

The five animations share a Chinese vector source and an English translation map. Scientific sample values, geometry, residue positions and recorded scores are shared across both locales. These are scripted visualizations and historical replays; their animation durations do not measure inference or training time.

Install `Pillow` from `scripts/gifs/requirements.txt`. Browser capture requires Node.js, `npx`, and Playwright CLI. The renderer uses the Codex Playwright wrapper when present, otherwise `playwright-cli` or the npm CLI package. Set `PLAYWRIGHT_CLI` to an executable path to override it.

Chinese exports use a CJK-capable system font; the source lists PingFang SC with sans-serif fallbacks.

From the repository root:

```bash
python -m pip install -r scripts/gifs/requirements.txt
python scripts/render_gifs.py --case all --lang all
```

To review English keyframes before a full export:

```bash
python scripts/render_gifs.py --case all --lang en --keys-only
```

Exports are `assets/{framework,spectra,protein,crystal,rna-iterations}-{en,zh}.gif`. Generated locale pages stay under `var/tmp/bilingual-gifs/`; captures and verification reports stay under `output/playwright/bilingual-gifs/`. The renderer checks for untranslated English text and verifies decoded GIF composite frames against the captured vectors. Use `--encode-only` to re-encode existing frame captures.

The crystal visualization uses the JARVIS JVASP-90856 TiCuSiAs geometry and reference energy. The protein visualization uses MPBind 4OYT chain B and reference interface annotations. The spectra replay uses QM9S spectra-000920. The RNA replay preserves the recorded validation and complete-test results in the source illustration.
