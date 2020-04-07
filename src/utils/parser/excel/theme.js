function rgbToHsv(arr) {
  let h = 0;
  let s = 0;
  let v = 0;
  const r = arr[0];
  const g = arr[1];
  const b = arr[2];
  arr.sort((x, y) => x - y);
  const max = arr[2];
  const min = arr[0];
  v = max / 255;
  if (max === 0) {
    s = 0;
  } else {
    s = 1 - (min / max);
  }
  if (max === min) {
    h = 0;
  } else if (max === r && g >= b) {
    h = 60 * ((g - b) / (max - min)) + 0;
  } else if (max === r && g < b) {
    h = 60 * ((g - b) / (max - min)) + 360;
  } else if (max === g) {
    h = 60 * ((b - r) / (max - min)) + 120;
  } else if (max === b) {
    h = 60 * ((r - g) / (max - min)) + 240;
  }
  h = parseInt(h, 0);
  s = parseInt(s * 100, 0);
  v = parseInt(v * 100, 0);
  return [h, s, v];
}

function hsvToRgb(arr) {
  const h = arr[0];
  let s = arr[1];
  let v = arr[2];
  s /= 100;
  v /= 100;
  let r = 0;
  let g = 0;
  let b = 0;
  const i = parseInt((h / 60) % 6, 0);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      break;
  }
  r = parseInt(r * 255.0, 0);
  g = parseInt(g * 255.0, 0);
  b = parseInt(b * 255.0, 0);
  return [r, g, b];
}

function applyTint(lum, tint) {
  if (tint > 0) {
    return Math.round(lum * (1 - tint) + (255 - 255 * (1 - tint)));
  }
  return tint < 0 ? Math.round((lum * (1 + tint))) : lum;
}

function calTintColor([r, g, b], tint) {
  return [r, g, b].map(lum => applyTint(lum, tint));
}


class Theme {
  constructor(workbook) {
    // eslint-disable-next-line no-undef
    const parser = new DOMParser();
    // eslint-disable-next-line
    Object.values(workbook['_themes']).forEach((_theme) => {
      this.theme = parser.parseFromString(_theme, 'text/xml');
    });
    this.color = this.theme.getElementsByTagName('a:clrScheme')[0].childNodes;
  }

  getColor(idx, tint) {
    let i = idx;
    // fix sort bug
    switch (idx) {
      case 0:
        i = 1;
        break;
      case 1:
        i = 0;
        break;
      case 2:
        i = 3;
        break;
      case 3:
        i = 2;
        break;
      default:
    }
    let color;
    const colorNode = this.color[i].children[0];
    if (colorNode.attributes.lastClr) {
      color = colorNode.attributes.lastClr.value;
    } else {
      color = colorNode.attributes.val.value;
    }
    if (tint) {
      let rgb = [];
      for (let s = 0; s < color.length; s += 2) {
        rgb.push(parseInt(color.substring(s, s + 2), 16));
      }
      rgb = calTintColor(rgb, tint);
      color = rgb.map((lum) => {
        let hex = lum.toString(16);
        if (hex.length === 1) {
          hex = `0${hex}`;
        }
        return hex;
      }).join('');
    }
    return `#${color}`;
  }
}

export default Theme;
