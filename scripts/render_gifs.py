"""Render the bilingual README GIFs from their deterministic SVG animations.

Requires Pillow, Node.js, npx, and the Playwright CLI. Browser capture uses the
Codex Playwright wrapper when available, or an installed playwright-cli command.
Generated HTML and frame captures stay in var/ and output/, outside Git.
"""
from __future__ import annotations

import argparse
import functools
import http.server
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import threading

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'scripts/gifs/source'
WORK = ROOT / 'var/tmp/bilingual-gifs'
CAPTURES = ROOT / 'output/playwright/bilingual-gifs'
ASSETS = ROOT / 'assets'
CASES = {
    'framework': ('framework-animation.js', 'renderFrameworkAt', 'frameworkReady', 'frameworkError', 32, 1920, 720,
                  [0, 3, 5.3, 7.8, 10.4, 13.8, 16.8, 19.5, 22, 24.5, 28, 31.9]),
    'spectra': ('spectra-animation.js', 'renderSpectraFinalAt', 'spectraFinalReady', 'spectraFinalError', 16, 1280, 720,
                [0, 2.9, 5.2, 8.9, 10.45, 12.4, 15.3]),
    'protein': ('protein-first-frame.js', 'renderProteinAt', 'firstFrameReady', '', 18, 1280, 720,
                [0, 3, 7, 10.5, 13.5, 17.8]),
    'crystal': ('crystal-first-frame.js', 'renderCrystalAt', 'firstFrameReady', '', 20, 1280, 720,
                [0, 4.2, 6.8, 10.5, 14, 19.8]),
    'rna-iterations': ('rna-rsi.js', 'renderRsiAt', 'rnaRsiReady', 'rnaRsiError', 36, 1280, 720,
                       [0, 4.8, 8.6, 13.6, 17.6, 20.5, 24.5, 28.8, 32.5, 35.9]),
}
COMMENTS = {
    'framework': 'Conceptual scientific input framework; protein encoder and numeric spectra branches join text embeddings. Scripted 32-second illustration.',
    'spectra': 'QM9S spectra-000920. Scripted replay of the recorded explanation and molecular prediction; editorial timing.',
    'protein': 'MPBind 4OYT chain B. Sequence and reference interface annotations; scripted visualization, not a live prediction.',
    'crystal': 'JARVIS JVASP-90856 TiCuSiAs. Crystal geometry and reference formation energy; scripted visualization, not a live prediction.',
    'rna-iterations': 'Historical ncRNA research iterations. Validation: 612 RNAs. Full test: 2600 RNAs. Accuracies: 90.04, 94.65, 96.73, 97.35 percent. Scripted replay.',
}


def prepare():
    translations = json.loads((ROOT / 'scripts/gifs/translations-en.json').read_text())
    translations.update({'已展开 ${count} 个位点': 'Revealed ${count} sites'})
    pattern = re.compile('|'.join(re.escape(key) for key in sorted(translations, key=len, reverse=True)))
    for lang in ('en', 'zh'):
        target = WORK / lang
        (target / 'assets').mkdir(parents=True, exist_ok=True)
        for source in SOURCE.rglob('*'):
            if not source.is_file():
                continue
            text = source.read_text()
            if lang == 'en':
                if source.name == 'framework-animation-base.svg':
                    text = text.replace('>Projector</text>', '>Feature mapping</text>')
                text = pattern.sub(lambda match: translations[match.group()], text)
                if source.name == 'spectra-first-frame.svg':
                    text = re.sub(r'<text[^>]* x="79" y="(?:253|386|519)"[^>]*>[^<]*</text>', '', text)
                text = text.replace("'个'", "'sites'")
                # English step labels are longer; reserve more of each rail for copy.
                text = text.replace('x+129', 'x+205').replace('x+110', 'x+205')
                if source.name == 'crystal-first-frame.js':
                    text = text.replace('tx(175,150,caption', 'tx(255,150,caption')
                if source.name == 'protein-first-frame.js':
                    text = text.replace("tx(931,605,'[position1, position2, …]'", "tx(953,605,'[position1, position2, …]'")
            (target / source.relative_to(SOURCE)).write_text(text)
        shutil.copyfile(ROOT / 'scripts/gifs/frame-layout.js', target / 'frame-layout.js')
        for kind, (script, method, ready, error, duration, width, height, keys) in CASES.items():
            html = f'''<!doctype html><html lang="{lang}"><meta charset="utf-8"><link rel="icon" href="data:,"><title>{kind} · {lang}</title>
<style>*{{box-sizing:border-box}}html,body{{margin:0;width:{width}px;height:{height}px;overflow:hidden;background:#f8f9f8}}#frame>svg{{display:block;width:{width}px;height:{height}px}}text{{font-family:"PingFang SC","Helvetica Neue",Arial,sans-serif}}.mono{{font-family:"SFMono-Regular",Consolas,monospace}}</style>
<script defer src="samples.js"></script><script defer src="frame-layout.js"></script><script defer src="{script}"></script><main id="frame"></main></html>'''
            (target / f'{kind}.html').write_text(html)
    print('Prepared both source locales.', flush=True)


def cli_command():
    configured = os.environ.get('PLAYWRIGHT_CLI')
    wrapper = Path.home() / '.codex/skills/playwright/scripts/playwright_cli.sh'
    if configured:
        return [configured]
    if wrapper.is_file():
        return [str(wrapper)]
    if shutil.which('playwright-cli'):
        return ['playwright-cli']
    return ['npx', '--yes', '--package', '@playwright/cli', 'playwright-cli']


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def capture(kind, lang, fps, keys_only=False):
    _, method, ready, error, duration, width, height, keys = CASES[kind]
    folder = CAPTURES / f'{kind}-{lang}' / ('keys' if keys_only else 'frames')
    folder.mkdir(parents=True, exist_ok=True)
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/var/tmp/bilingual-gifs/{lang}/{kind}.html?t=0'
    session = f'sage-gif-{kind}-{lang}'
    command = cli_command() + ['--session', session]
    opened = subprocess.run(command + ['open', url], text=True, capture_output=True)
    if opened.returncode:
        raise RuntimeError(opened.stdout + opened.stderr)
    times = keys if keys_only else [index/fps for index in range(duration*fps)]
    reports = []
    try:
        for start in range(0, len(times), 36):
            batch = times[start:start+36]
            names = [f'{start+i:04d}' for i in range(len(batch))]
            settings = {'url': url, 'method': method, 'ready': ready, 'error': error, 'kind': kind, 'lang': lang,
                        'width': width, 'height': height, 'frames': list(zip(names, batch)), 'folder': str(folder),
                        'checks': keys_only}
            code = '''async (page) => {
  const s = SETTINGS;
  await page.goto(s.url);
  await page.waitForFunction(s => Boolean(window[s.ready] || (s.error && window[s.error])), s);
  if(s.error && await page.evaluate(s => window[s.error], s)) throw new Error('Animation initialization failed');
  await page.setViewportSize({width:s.width,height:s.height});
  await page.evaluate(() => document.fonts.ready);
  const checks = [];
  for(const [name,time] of s.frames){
    const result = await page.evaluate(({s,time}) => {
      window[s.method](time);
      return window.finishGifFrame(s.kind,s.lang);
    }, {s,time});
    if(result.untranslated.length) throw new Error('Untranslated visible SVG text: '+JSON.stringify(result.untranslated));
    await page.screenshot({path:s.folder+'/'+name+'.png'});
    if(s.checks) checks.push({time,...result});
  }
  return {captured:s.frames.length,last:s.frames.at(-1)[1],checks};
}'''.replace('SETTINGS', json.dumps(settings))
            result = subprocess.run(command + ['run-code', code], text=True, capture_output=True)
            if result.returncode:
                raise RuntimeError(result.stdout + result.stderr)
            payload = json.loads(result.stdout.split('### Result\n', 1)[1].split('\n### ', 1)[0])
            reports.extend(payload['checks'])
            print(f'{kind}-{lang}: captured {start+len(batch)}/{len(times)}', flush=True)
        (folder.parent / ('layout-check.json' if keys_only else 'capture.json')).write_text(json.dumps({
            'kind': kind, 'lang': lang, 'fps': fps, 'frames': len(times), 'duration': duration,
            'checks': reports}, ensure_ascii=False, indent=2)+'\n')
    finally:
        server.shutdown()
        server.server_close()
        subprocess.run(command + ['close'], text=True, capture_output=True)


def encode(kind, lang, fps):
    spec = CASES[kind]
    duration = spec[4]
    folder = CAPTURES / f'{kind}-{lang}'
    files = sorted((folder / 'frames').glob('*.png'))
    assert len(files) == duration*fps, (kind, lang, len(files))
    width = 960 if kind == 'crystal' else spec[5]
    height = round(spec[6]*width/spec[5])
    sample_indices = sorted({min(len(files)-1, round(time*fps)) for time in spec[7]})
    sheet = Image.new('RGB', (640, round(height*640/width)*len(sample_indices)), 'white')
    for row, index in enumerate(sample_indices):
        with Image.open(files[index]) as source:
            sample = source.convert('RGB').resize((640, round(height*640/width)), Image.Resampling.LANCZOS)
            sheet.paste(sample, (0, row*sample.height))
    palette = sheet.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    if kind == 'crystal':
        # Keep smooth atom materials while reserving a clean UI palette.
        colors = []
        def add_color(color):
            color = tuple(color)
            if color not in colors and len(colors) < 255:
                colors.append(color)
        for color in ('#243137', '#83918f', '#dbe4df', '#4b786a', '#ffffff', '#f8f9f8'):
            add_color(tuple(int(color[i:i+2], 16) for i in (1, 3, 5)))
        materials = [
            ('#ffffff', '#e6f1e9', '#9cbdab', '#638977', '#426351'),
            ('#fffef7', '#f7edda', '#ccb786', '#a38c60', '#796744'),
            ('#ffffff', '#eaf0f5', '#b7cbd3', '#7f9da7', '#587783'),
            ('#ffffff', '#f0eaf8', '#c2b1d7', '#9c87b5', '#75638e'),
        ]
        for material in materials:
            points = [tuple(int(color[i:i+2], 16) for i in (1, 3, 5)) for color in material]
            lengths = [math.dist(a, b) for a, b in zip(points, points[1:])]
            for index in range(38):
                distance = sum(lengths)*index/37
                for a, b, length in zip(points, points[1:], lengths):
                    if distance <= length:
                        add_color(tuple(round(x+(y-x)*distance/length) for x, y in zip(a, b)))
                        break
                    distance -= length
                else:
                    add_color(points[-1])
        for count in (100, 255):
            adaptive = sheet.quantize(colors=count, method=Image.Quantize.MEDIANCUT).getpalette()
            for index in range(count):
                add_color(adaptive[index*3:index*3+3])
        colors.extend([(255, 255, 255)]*(255-len(colors)))
        palette = Image.new('P', (1, 1))
        palette.putpalette([value for color in colors+[(255, 0, 255)] for value in color])
    elif kind == 'framework':
        # Small scientific plots contain categorical colors that a whole-frame
        # adaptive palette can otherwise merge into the larger blue/gray UI.
        source = (SOURCE/'assets/framework-animation-base.svg').read_text()
        reserved = []
        def reserve(color):
            rgb = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
            if rgb not in reserved:
                reserved.append(rgb)
        for color in ('#20262d', '#4d80b8', '#6f7883', '#6c8275', '#ffffff'):
            reserve(color)
        for color in re.findall(r'#[0-9a-fA-F]{6}', source):
            r, g, b = (int(color[i:i+2], 16) for i in (1, 3, 5))
            if max(r,g,b)-min(r,g,b) > 12 and not r < g < b:
                reserve(color)
        count = 255-len(reserved)
        adaptive = sheet.quantize(colors=count, method=Image.Quantize.MEDIANCUT).getpalette()[:count*3]
        palette = Image.new('P', (1, 1))
        palette.putpalette(adaptive+[value for color in reserved for value in color]+[255, 0, 255])
    else:
        palette.putpalette(palette.getpalette()[:255*3]+[255, 0, 255])
    (folder / 'palette.png').parent.mkdir(parents=True, exist_ok=True)
    palette.save(folder / 'palette.png')

    def indexed(file):
        with Image.open(file) as source:
            frame = source.convert('RGB')
            if frame.size != (width, height):
                frame = frame.resize((width, height), Image.Resampling.LANCZOS)
            rgb = frame
            frame = rgb.quantize(palette=palette, dither=Image.Dither.NONE)
            # Error diffusion belongs on colored scientific surfaces, not text.
            areas = {'spectra': (206, 183, 767, 581), 'crystal': (190, 190, 655, 578),
                     'protein': (870, 379, 1201, 468)}
            if kind in areas:
                region = tuple(round(value*width/spec[5]) for value in areas[kind])
                crop = rgb.crop(region)
                smooth = crop.quantize(palette=palette, dither=Image.Dither.FLOYDSTEINBERG)
                if kind == 'spectra':
                    frame.paste(smooth, region[:2])
                else:
                    r, g, b = crop.split()
                    high = ImageChops.lighter(ImageChops.lighter(r, g), b)
                    low = ImageChops.darker(ImageChops.darker(r, g), b)
                    mask = ImageChops.subtract(high, low).point([0]*11+[255]*245)
                    patch = frame.crop(region)
                    patch.paste(smooth, (0, 0), mask)
                    frame.paste(patch, region[:2])
            return frame.point(list(range(255))+[0])

    frames, delays, previous = [], [], None
    for index, file in enumerate(files):
        current = indexed(file)
        delay = (round((index+1)*100/fps)-round(index*100/fps))*10
        if previous is None:
            frames.append(current.copy())
            delays.append(delay)
        else:
            diff = ImageChops.difference(Image.frombytes('L', current.size, current.tobytes()),
                                         Image.frombytes('L', previous.size, previous.tobytes()))
            if diff.getbbox() is None:
                delays[-1] += delay
            else:
                delta = current.copy()
                delta.paste(255, mask=diff.point([255]+[0]*255))
                frames.append(delta)
                delays.append(delay)
        previous = current
    output = ASSETS / f'{kind}-{lang}.gif'
    frames[0].save(output, save_all=True, append_images=frames[1:], duration=delays,
                   loop=0, optimize=False, disposal=1, transparency=255,
                   comment=(COMMENTS[kind]+' Locale: '+lang+'.').encode())
    # Verify decoded composite frames, including changed text and translucent layers.
    checks, elapsed = [], 0
    with Image.open(output) as gif:
        count, loop = gif.n_frames, gif.info.get('loop')
        pending = set(sample_indices)
        for frame in range(count):
            gif.seek(frame)
            delay = gif.info['duration']
            for index in sorted(pending):
                at = round(index*100/fps)*10
                if elapsed <= at < elapsed+delay:
                    actual = gif.convert('RGB')
                    assert ImageChops.difference(actual, indexed(files[index]).convert('RGB')).getbbox() is None, (kind, lang, at)
                    actual.save(folder / f'encoded-{index:04d}.png')
                    checks.append(at)
                    pending.remove(index)
            elapsed += delay
    assert not pending and elapsed == duration*1000 and loop == 0
    report = {'kind': kind, 'lang': lang, 'duration_ms': elapsed, 'rendered_frames': len(files),
              'stored_frames': count, 'dimensions': [width, height], 'bytes': output.stat().st_size,
              'loop': loop, 'verified_composite_times_ms': checks}
    (folder/'gif-check.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--case', choices=['all']+list(CASES), default='all')
    parser.add_argument('--lang', choices=['all', 'en', 'zh'], default='all')
    parser.add_argument('--fps', type=int, default=12)
    parser.add_argument('--prepared', action='store_true', help='Reuse the prepared source locales')
    parser.add_argument('--prepare-only', action='store_true')
    parser.add_argument('--keys-only', action='store_true')
    parser.add_argument('--encode-only', action='store_true')
    args = parser.parse_args()
    if not args.encode_only and not args.prepared:
        prepare()
    if args.prepare_only:
        return
    cases = CASES if args.case == 'all' else [args.case]
    languages = ['en', 'zh'] if args.lang == 'all' else [args.lang]
    for kind in cases:
        for lang in languages:
            if not args.encode_only:
                capture(kind, lang, args.fps, args.keys_only)
            if not args.keys_only:
                encode(kind, lang, args.fps)


if __name__ == '__main__':
    main()
