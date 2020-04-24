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
    const parser = new DOMParser();
    Object.values(workbook._themes).forEach((_theme) => {
      this.theme = parser.parseFromString(_theme, 'text/xml');
      this.color = this.theme.getElementsByTagName('a:clrScheme')[0].childNodes;
    });
  }

  getColor(idx, tint) {
    if (typeof this.color === 'undefined') return '#000';
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
