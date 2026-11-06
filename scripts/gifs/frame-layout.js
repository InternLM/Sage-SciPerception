// Fit English copy to the original vector cards without changing the diagrams.
window.finishGifFrame = (kind, lang) => {
  const svg = document.querySelector('#frame > svg');
  if (!svg) throw new Error('Animation SVG is missing');
  if (lang !== 'en') return {adjusted: [], untranslated: []};
  const adjusted = [];
  for (const text of svg.querySelectorAll('text')) {
    const value = text.textContent;
    if (value.length < 3 || !/[A-Za-z]/.test(value)) continue;
    const x = Number(text.getAttribute('x'));
    const y = Number(text.getAttribute('y'));
    const anchor = text.getAttribute('text-anchor') || 'start';
    let max = Infinity;
    if (kind === 'framework') {
      if ([87, 301].includes(x)) max = 170;
      else if (x === 78) max = 410;
      else if (x === 128) max = 360;
      else if (x === 740 || x === 783) max = 270;
      else if (x === 1145) max = y > 880 ? 490 : 225;
      else if (x === 1251) max = 390;
      else if (x === 1451) max = 245;
      else if (x === 1825) max = 280;
      else if (x === 2086) max = 215;
      else if (x === 2195) max = 235;
      else if (x === 593) max = 218;
      else if (x === 835) max = 740;
    } else {
      // Titles and headings end before the right-hand score or identity chip.
      if (x === 32 || x === 33) max = 945;
      else if (x === 56 && y === 151) max = kind === 'rna-iterations' ? 548 : 540;
      else if (x === 255 && y === 150) max = 350;
      else if (y >= 665) max = 180;
      else if (x >= 830 && anchor === 'start') max = 1224 - x;
      else if (x >= 830 && anchor === 'middle') max = 340;
      else if (x >= 830 && anchor === 'end') max = 330;
      if (kind === 'spectra' && x === 894) max = 304;
      if (kind === 'rna-iterations') {
        if (x === 938 && y === 426) max = 106;
        if (x === 1193 && y === 427) max = 181;
        if (x === 881) max = 213;
        if ([310, 543].includes(x) && [355, 374, 375].includes(y)) max = 132;
        if (x === 423 && [418, 437, 546].includes(y)) max = y === 546 ? 365 : 128;
        if ([186, 659.5].includes(x)) max = 116;
        if (x === 143 && y === 300) max = 108;
        if (x === 139 && y === 247) max = 105;
        if (x === 632 && y === 298) max = 135;
        if (x === 415 && y === 355) max = 64;
      }
    }
    if (!Number.isFinite(max)) continue;
    const dynamicSize = ['cot-answer-status', 'fw-projector-caption'].includes(text.id);
    if (!text.dataset.naturalSize || dynamicSize) {
      text.dataset.naturalSize = text.getAttribute('font-size') || '18';
    }
    const size = Number(text.dataset.naturalSize);
    text.setAttribute('font-size', size);
    const width = text.getComputedTextLength();
    if (width > max) {
      const fitted = Math.max(8, Math.floor(size * max / width * 100) / 100);
      text.setAttribute('font-size', fitted);
      adjusted.push({text: value, from: size, to: fitted, max});
    }
  }
  const untranslated = [...svg.querySelectorAll('text')]
    .map(el => el.textContent).filter(value => /[\u3400-\u9fff]/.test(value));
  return {adjusted, untranslated};
};
