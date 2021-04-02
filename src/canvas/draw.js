import { getFontSizePxByPt } from '../model/font';

function dpr() {
  return window.devicePixelRatio || 1;
}

function thinLineWidth() {
  return dpr() - 0.5;
}

function npx(px) {
  return parseInt(px * dpr(), 10);
}

function rpx(px) {
  return parseInt(px / dpr(), 10);
}

function npxLine(px) {
  return npx(px) - 0.25;
  // const n = npx(px);
  // return n > 0 ? n - 0.5 : 0.5;
}

class DrawBox {
  constructor(x, y, w, h, padding = 0) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.padding = padding;
    this.bgcolor = '#ffffff';
    // border: [width, style, color]
    this.borderTop = null;
    this.borderRight = null;
    this.borderBottom = null;
    this.borderLeft = null;
  }

  setBorders({ top, bottom, left, right }) {
    if (top) this.borderTop = top;
    if (right) this.borderRight = right;
    if (bottom) this.borderBottom = bottom;
    if (left) this.borderLeft = left;
  }

  innerWidth() {
    return this.width - (this.padding * 2) - 2;
  }

  innerHeight() {
    return this.height - (this.padding * 2) - 2;
  }

  textx(align) {
    const { width, padding } = this;
    let { x } = this;
    if (align === 'left') {
      x += padding;
    } else if (align === 'center') {
      x += width / 2;
    } else if (align === 'right') {
      x += width - padding;
    }
    return x;
  }

  texty(align, h) {
    const { height, padding } = this;
    let { y } = this;
    if (align === 'top') {
      y += padding;
    } else if (align === 'middle') {
      y += height / 2 - h / 2;
    } else if (align === 'bottom') {
      y += height - padding - h;
    }
    return y;
  }

  topxys() {
    const { x, y, width } = this;
    return [[x, y], [x + width, y]];
  }

  rightxys() {
    const {
      x, y, width, height,
    } = this;
    return [[x + width, y], [x + width, y + height]];
  }

  bottomxys() {
    const {
      x, y, width, height,
    } = this;
    return [[x, y + height], [x + width, y + height]];
  }

  leftxys() {
    const {
      x, y, height,
    } = this;
    return [[x, y], [x, y + height]];
  }
}

function drawFontLine(type, tx, ty, align, blheight, blwidth, isDouble = false) {
  const floffset = {
    x: 0,
    y: 0,
  };
  if (type === 'underline') {
    floffset.y = -blheight / 2;
  }

  if (align === 'center') {
    floffset.x = blwidth / 2;
  } else if (align === 'right') {
    floffset.x = blwidth;
  }
  this.line(
    [tx - floffset.x, ty - floffset.y],
    [tx - floffset.x + blwidth, ty - floffset.y],
  );
  if (isDouble) {
    this.line(
      [tx - floffset.x, ty - floffset.y - npx(1)],
      [tx - floffset.x + blwidth, ty - floffset.y - npx(1)],
    );
  }
}

function combineFontStyle(partialStyle, mainFont) {
  const style = {};
  if (partialStyle.font) {
    const italic = Object.hasOwnProperty.call(partialStyle.font, 'italic') ? partialStyle.font.italic : mainFont.italic;
    const bold = Object.hasOwnProperty.call(partialStyle.font, 'bold') ? partialStyle.font.bold : mainFont.bold;
    const size = Object.hasOwnProperty.call(partialStyle.font, 'size') ? partialStyle.font.size : mainFont.size;
    const name = Object.hasOwnProperty.call(partialStyle.font, 'name') ? partialStyle.font.name : mainFont.name;
    style.font = `${italic ? 'italic' : ''} ${bold ? 'bold' : ''} ${npx(getFontSizePxByPt(size))}px ${name}`;
  }
  if (partialStyle.color) {
    style.fillStyle = partialStyle.color;
    style.strokeStyle = partialStyle.color;
  }
  return style;
}

function resolveSnippet(temp, texts, idx, richText) {
  temp.snippetCache.text = texts.substring(temp.startPos, idx + 1);
  temp.snippetCache.style = richText[temp.snippetIdxNow].style;
  temp.rowObjCache[temp.rowObjCache.length] = temp.snippetCache;
  temp.snippetCache = {
    width: 0,
  };
  temp.startPos = idx + 1;
}

function calulateOffsetX(align, textInfo, idx) {
  let offsetX = 0;
  if (align === 'center') {
    offsetX = -textInfo.width / 2;
    for (let n = 0; n <= idx; n += 1) {
      if (n === idx) {
        offsetX += textInfo[n].width / 2;
      } else {
        offsetX += textInfo[n].width;
      }
    }
  }
  if (align === 'left') {
    for (let n = 0; n < idx; n += 1) {
      offsetX += textInfo[n].width;
    }
  }
  if (align === 'right') {
    for (let n = idx + 1; n < textInfo.length; n += 1) {
      offsetX -= textInfo[n].width;
    }
  }
  return offsetX;
}

class Draw {
  constructor(el, width, height) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.resize(width, height);
    this.ctx.scale(dpr(), dpr());
  }

  npx(px) {
    return npx(px);
  }

  resize(width, height) {
    // console.log('dpr:', dpr);
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.el.width = npx(width);
    this.el.height = npx(height);
  }

  attr(options) {
    Object.assign(this.ctx, options);
    return this;
  }

  save() {
    this.ctx.save();
    this.ctx.beginPath();
    return this;
  }

  restore() {
    this.ctx.restore();
    return this;
  }

  beginPath() {
    this.ctx.beginPath();
    return this;
  }

  translate(x, y) {
    this.ctx.translate(npx(x), npx(y));
    return this;
  }

  clearRect(x, y, w, h) {
    this.ctx.clearRect(x, y, npx(w), npx(h));
    return this;
  }

  fillRect(x, y, w, h) {
    this.ctx.fillRect(
      npx(x) - 0.5,
      npx(y) - 0.5,
      npx(w),
      npx(h),
    );
    return this;
  }

  fillText(text, x, y) {
    this.ctx.fillText(text, npx(x), npx(y));
    return this;
  }

  fillTextRawXY(text, nx, ny) {
    this.ctx.fillText(text, nx, ny);
    return this;
  }

  /*
    txt: render text
    box: DrawBox
    attr: {
      align: left | center | right
      valign: top | middle | bottom
      color: '#333333',
      strike: false,
      font: {
        name: 'Arial',
        size: 14,
        bold: false,
        italic: false,
      }
    }
    textWrap: text wrapping
  */
  text(text = '', box, attr = {}, textWrap = true, richText) {
    const { ctx } = this;
    const {
      align, valign, font, color, strike, underline,
    } = attr;
    const tx = box.textx(align);
    ctx.save();
    ctx.beginPath();
    this.attr({
      textAlign: align,
      textBaseline: 'middle',
      font: `${font.italic ? 'italic' : ''} ${font.bold ? 'bold' : ''} ${npx(getFontSizePxByPt(font.size))}px ${font.name}`,
      fillStyle: color,
      strokeStyle: color,
    });
    if (richText && Array.isArray(richText) && richText.length > 0) {
      const biw = npx(box.innerWidth());
      const newTexts = [];
      const linePosInfo = [];
      const snippetPosInfo = [];
      let l = 0;
      const texts = `${richText.map((snippet) => {
        if (snippet.text) {
          l += snippet.text.length;
        }
        snippetPosInfo.push(l);
        return snippet.text;
      }).join('')}`;
      Array.prototype.forEach.call(texts, (ch, idx) => {
        if (ch === '\n') {
          linePosInfo.push(idx);
        }
      });
      const temp = {
        startPos: 0,
        snippetIdxNow: 0,
        snippetCache: {
          width: 0,
        },
        rowObjCache: [],
      };
      Object.assign(temp.rowObjCache, {
        maxFontSize: getFontSizePxByPt(font.size),
        width: 0,
      });
      for (let idx = 0; idx < texts.length; idx += 1) {
        let isSnippetEnd = false;
        // set snippet style
        if (richText[temp.snippetIdxNow].style) {
          const style = combineFontStyle(richText[temp.snippetIdxNow].style, font);
          this.attr(style);
        }
        // measure char width
        const charWidth = ctx.measureText(texts[idx]).width;
        temp.rowObjCache.width += charWidth;
        temp.snippetCache.width += charWidth;
        // find the fragment position
        for (let si = temp.snippetIdxNow; si < snippetPosInfo.length; si += 1) {
          if (idx === snippetPosInfo[si] - 1) {
            resolveSnippet(temp, texts, idx, richText);
            isSnippetEnd = true;
            break;
          }
        }
        // calculate row wrap
        if ((textWrap && temp.rowObjCache.width >= biw) || linePosInfo.indexOf(idx) > -1) {
          if ((textWrap && temp.rowObjCache.width >= biw) && temp.rowObjCache.width !== charWidth) {
            idx -= 1;
            temp.rowObjCache.width -= charWidth;
            if (!isSnippetEnd) {
              temp.snippetCache.width -= charWidth;
              resolveSnippet(temp, texts, idx, richText);
              const lastSnippet = temp.rowObjCache[temp.rowObjCache.length - 1];
              if (lastSnippet.text.length === 0) {
                temp.rowObjCache.splice(-1);
              }
            } else {
              const lastSnippet = temp.rowObjCache[temp.rowObjCache.length - 1];
              lastSnippet.text = lastSnippet.text.substr(0, lastSnippet.text.length - 1);
              lastSnippet.width -= charWidth;
              if (lastSnippet.text.length === 0) {
                temp.rowObjCache.splice(-1);
              }
              temp.startPos = idx + 1;
              isSnippetEnd = false;
            }
          } else if (!isSnippetEnd) {
            resolveSnippet(temp, texts, idx, richText);
          }
          newTexts.push(temp.rowObjCache);
          temp.rowObjCache = [];
          Object.assign(temp.rowObjCache, {
            maxFontSize: getFontSizePxByPt(font.size),
            width: 0,
          });
        }
        // handle last char
        if (idx === texts.length - 1) {
          if (!isSnippetEnd) {
            resolveSnippet(temp, texts, idx, richText);
          }
          newTexts.push(temp.rowObjCache);
        }
        if (isSnippetEnd) {
          temp.snippetIdxNow += 1;
        }
      }
      // set row max font size and calculate total height
      let txtHeight = 0;
      newTexts.forEach((textInfo) => {
        textInfo.forEach((snippetInfo) => {
          if (snippetInfo.style && snippetInfo.style.font) {
            if (getFontSizePxByPt(snippetInfo.style.font.size || 0)
              > textInfo.maxFontSize) {
              textInfo.maxFontSize = getFontSizePxByPt(
                snippetInfo.style.font.size,
              );
            }
          }
        });
        txtHeight += (textInfo.maxFontSize + 2);
      });
      // console.log('reformat result:',newTexts);
      // draw rich text
      let ty = box.texty(valign, txtHeight);
      newTexts.forEach((textInfo) => {
        ty += (textInfo.maxFontSize / 2 + 1);
        textInfo.forEach((snippetInfo, idx) => {
          const offsetX = calulateOffsetX(align, textInfo, idx);
          this.attr(combineFontStyle(snippetInfo.style, font));
          let offsetY;
          let fontSize;
          if (snippetInfo.style && snippetInfo.style.font && snippetInfo.style.font.size) {
            offsetY = textInfo.maxFontSize - getFontSizePxByPt(snippetInfo.style.font.size);
            fontSize = getFontSizePxByPt(snippetInfo.style.font.size);
          } else {
            offsetY = textInfo.maxFontSize - getFontSizePxByPt(font.size);
            fontSize = getFontSizePxByPt(font.size);
          }
          let snippetStrike;
          let snippetUnderline;
          if (snippetInfo.style && snippetInfo.style.font && Object.hasOwnProperty.call(snippetInfo.style.font, 'strike')) {
            snippetStrike = snippetInfo.style.font.strike;
          } else {
            snippetStrike = strike;
          }
          if (snippetInfo.style && snippetInfo.style.font && Object.hasOwnProperty.call(snippetInfo.style.font, 'underline')) {
            snippetUnderline = snippetInfo.style.font.underline;
          } else {
            snippetUnderline = underline;
          }
          this.fillTextRawXY(snippetInfo.text, npx(tx) + offsetX, npx(ty + offsetY / 2));
          if (snippetStrike) {
            drawFontLine.call(this, 'strike', rpx(npx(tx) + offsetX), ty + offsetY / 2, align, fontSize, rpx(snippetInfo.width));
          }
          if (snippetUnderline) {
            drawFontLine.call(this, 'underline', rpx(npx(tx) + offsetX), ty + offsetY / 2, align, fontSize, rpx(snippetInfo.width), snippetUnderline === 'double');
          }
        });
        ty += (textInfo.maxFontSize / 2 + 1);
      });
    } else {
      const texts = `${text}`.split('\n');
      const fontSize = getFontSizePxByPt(font.size);
      let newTexts = [];
      // calculate and redistribute rows
      if (textWrap) {
        const biw = npx(box.innerWidth());
        texts.forEach((it) => {
          // console.log(it, it.length, ctx.font, ctx.measureText(it).width, biw);
          const txtWidth = ctx.measureText(it).width;
          if (txtWidth > biw) {
            let textLine = {
              w: 0,
              len: 0,
              start: 0,
            };
            for (let i = 0; i < it.length; i += 1) {
              if (textLine.w > biw) {
                if (textLine.len > 1) {
                  newTexts.push(it.substr(textLine.start, textLine.len - 1));
                  textLine = {
                    w: 0,
                    len: 0,
                    start: i - 1,
                  };
                  i -= 1;
                } else {
                  newTexts.push(it.substr(textLine.start, textLine.len));
                  textLine = {
                    w: 0,
                    len: 0,
                    start: i,
                  };
                }
              }
              textLine.len += 1;
              textLine.w += ctx.measureText(it[i]).width;
            }
            if (textLine.len > 0) {
              newTexts.push(it.substr(textLine.start, textLine.len));
            }
          } else {
            newTexts.push(it);
          }
        });
      } else {
        newTexts = texts;
      }
      // draw text
      const txtHeight = newTexts.length * (fontSize + 2);
      let ty = box.texty(valign, txtHeight);
      newTexts.forEach((txt) => {
        ty += fontSize / 2 + 1;
        const txtWidth = ctx.measureText(txt).width;
        this.fillText(txt, tx, ty);
        if (strike) {
          drawFontLine.call(this, 'strike', tx, ty, align, fontSize, rpx(txtWidth));
        }
        if (underline) {
          drawFontLine.call(this, 'underline', tx, ty, align, fontSize, rpx(txtWidth), underline === 'double');
        }
        ty += fontSize / 2 + 1;
      });
    }
    ctx.restore();
    return this;
  }

  border(style, color) {
    const { ctx } = this;
    ctx.lineWidth = thinLineWidth();
    ctx.strokeStyle = color || '#000';
    // console.log('style:', style);
    if (style === 'medium') {
      ctx.lineWidth = npx(2) - 0.5;
    } else if (style === 'thick') {
      ctx.lineWidth = npx(3);
    } else if (style === 'dashed') {
      ctx.setLineDash([npx(3), npx(2)]);
    } else if (style === 'dotted') {
      ctx.setLineDash([npx(1), npx(1)]);
    } else if (style === 'double') {
      ctx.setLineDash([npx(2), 0]);
    }
    return this;
  }

  line(...xys) {
    const { ctx } = this;
    if (xys.length > 1) {
      const [x, y] = xys[0];
      ctx.beginPath();
      ctx.moveTo(npxLine(x), npxLine(y));
      for (let i = 1; i < xys.length; i += 1) {
        const [x1, y1] = xys[i];
        ctx.lineTo(npxLine(x1), npxLine(y1));
      }
      ctx.stroke();
    }
    return this;
  }

  strokeBorders(box) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    // border
    const {
      borderTop, borderRight, borderBottom, borderLeft,
    } = box;
    if (borderTop && borderTop.length > 0) {
      this.border(...borderTop);
      this.line(...box.topxys());
    }

    if (borderRight && borderRight.length > 0) {
      this.border(...borderRight);
      this.line(...box.rightxys());
    }

    if (borderBottom && borderBottom.length > 0) {
      this.border(...borderBottom);
      this.line(...box.bottomxys());
    }

    if (borderLeft && borderLeft.length > 0) {
      this.border(...borderLeft);
      this.line(...box.leftxys());
    }

    ctx.restore();
  }

  dropdown(box) {
    const { ctx } = this;
    const {
      x, y, width, height,
    } = box;
    const sx = x + width - 15;
    const sy = y + height - 15;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx), npx(sy));
    ctx.lineTo(npx(sx + 8), npx(sy));
    ctx.lineTo(npx(sx + 4), npx(sy + 6));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, .45)';
    ctx.fill();
    ctx.restore();
  }

  comment(box) {
    const { ctx } = this;
    const { x, y, width } = box;
    const sx = x + width - 1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx - 8), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y + 8));
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, .65)';
    ctx.fill();
    ctx.restore();
  }

  error(box) {
    const { ctx } = this;
    const { x, y, width, height } = box;

    const sy = y + height - 1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(x + 2), npx(sy - 1));

    for (let i = 0; i < width - 2; i += 2) {
      const fix = (i / 2) % 2;
      ctx.lineTo(npx(x + 2 + i), npx(sy - 1 - fix * 2));
    }

    ctx.lineWidth = npx(1) - 0.5;
    ctx.strokeStyle = 'rgba(255, 0, 0, .65)';
    ctx.stroke();
    ctx.restore();
  }

  frozen(box) {
    const { ctx } = this;
    const { x, y, width, height } = box;
    ctx.save();
    ctx.fillStyle = 'rgba(193,193,193,0.2)';
    ctx.fillRect(
      npx(x),
      npx(y),
      npx(width),
      npx(height),
    );
    ctx.restore();
  }

  rect(box, dtextcb) {
    const { ctx } = this;
    const {
      x, y, width, height, bgcolor,
    } = box;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = bgcolor || '#fff';
    ctx.rect(
      npx(x), npx(y),
      npx(width) - 1.5,
      npx(height) - 1.5,
    );
    ctx.clip();
    ctx.fill();
    dtextcb();
    ctx.restore();
  }
}

export default {};
export {
  Draw,
  DrawBox,
  thinLineWidth,
  npx,
};
