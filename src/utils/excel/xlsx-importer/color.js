const colorTable = [
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  '#000000', // 8
  '#ffffff', // 9
  '#ff0000', // 10
  '#00ff00', // 11
  '#0000ff', // 12
  '#ffff00', // 13
  '#ff00ff', // 14
  '#00ffff', // 15
  '#800000', // 16
  '#008000', // 17
  '#000080', // 18
  '#808000', // 19
  '#800080', // 20
  '#008080', // 21
  '#c0c0c0', // 22
  '#808080', // 23
  '#9999ff', // 24
  '#7f0000', // 25
  '#ffffcc', // 26
  '#ccffff', // 27
  '#660066', // 28
  '#ff8080', // 29
  '#0066cc', // 30
  '#ccccff', // 31
  '#000066', // 32
  '#ff00ff', // 33
  '#ffff00', // 34
  '#00ffff', // 35
  '#660066', // 36
  '#660000', // 37
  '#006666', // 38
  '#0000ff', // 39
  '#00ccff', // 40
  '#ccffff', // 41
  '#ccffcc', // 42
  '#ffff99', // 43
  '#99ccff', // 44
  '#ff99cc', // 45
  '#cc99ff', // 46
  '#ffcc99', // 47
  '#3366ff', // 48
  '#33cccc', // 49
  '#99cc00', // 50
  '#ffcc00', // 51
  '#ff9900', // 52
  '#ff6600', // 53
  '#666699', // 54
  '#969696', // 55
  '#003366', // 56
  '#339966', // 57
  '#003300', // 58
  '#333300', // 59
  '#993300', // 60
  '#993366', // 61
  '#333399', // 62
  '#333333', // 63
  '#000000', // 64 System foreground
  '#ffffff', // 65 System background
];

function transArgbToRgb(argb) {
  return `#${argb.substring(2)}`;
}

function getDefaultIndexColor(index) {
  let i = index;
  // 0-7 are redundant of 8-15 to preserve backwards compatibility
  if (index >= 0 && index < 8) {
    i += 8;
  }
  return colorTable[i];
}

function transRgbToArgb(rgb) {
  let srgb = rgb;
  if (rgb.indexOf('#') === 0) {
    srgb = srgb.substring(1);
  }
  const argb = ['FF'];
  const step = Math.floor(srgb.length / 3);
  for (let i = 0; i < srgb.length; i += step) {
    let hexString = srgb.substr(i, step);
    while (hexString.length < 2) {
      hexString = `0${hexString}`;
    }
    argb.push(hexString);
  }
  return `${argb.join('')}`;
}

export default {
  transArgbToRgb, getDefaultIndexColor, transRgbToArgb,
};
