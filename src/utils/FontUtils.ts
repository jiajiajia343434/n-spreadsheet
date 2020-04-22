/**
 * 字体,用于检测和获取系统中是否包含某种字体及名称映射
 */
export default class FontUtils {
    private static canvas: HTMLCanvasElement = null;

    private static ctx: CanvasRenderingContext2D = null;

    private static systemFont: string[] = null;

    private static _systemFontMap: { [type: string]: { ch: string, en: string } } = null;

    /** 返回一个包括系统设备字体的列表 */
    private static enumerateFonts(): string[] {
      if (this.systemFont != null) {
        return this.systemFont;
      }

      // 常用字体以Tahoma Arial Verdana三种为主，可以自己增加列表中
      const dataFont: { ch: string, en: string }[] = [];
      // windows
      dataFont.push({ ch: 'Arial', en: 'Arial' });
      dataFont.push({ ch: 'Tahoma', en: 'Tahoma' });// 适合英文字母
      dataFont.push({ ch: 'Verdana', en: 'Verdana' });// 间距较大适合数字
      dataFont.push({ ch: '微软雅黑', en: 'Microsoft Yahei' });
      dataFont.push({ ch: '宋体', en: 'SimSun' });
      dataFont.push({ ch: '黑体', en: 'SimHei' });
      dataFont.push({ ch: '微软正黑体', en: 'Microsoft JhengHei' });
      dataFont.push({ ch: '楷体', en: 'KaiTi' });
      dataFont.push({ ch: '新宋体', en: 'NSimSun' });
      dataFont.push({ ch: '仿宋', en: 'FangSong' });
      // OSX
      dataFont.push({ ch: '苹方', en: 'PingFang SC' });
      dataFont.push({ ch: '华文黑体', en: 'STHeiti' });
      dataFont.push({ ch: '华文楷体', en: 'STKaiti' });
      dataFont.push({ ch: '华文宋体', en: 'STSong' });
      dataFont.push({ ch: '华文仿宋', en: 'STFangsong' });
      dataFont.push({ ch: '华文中宋', en: 'STZhongsong' });
      dataFont.push({ ch: '华文琥珀', en: 'STHupo' });
      dataFont.push({ ch: '华文新魏', en: 'STXinwei' });
      dataFont.push({ ch: '华文隶书', en: 'STLiti' });
      dataFont.push({ ch: '华文行楷', en: 'STXingkai' });
      dataFont.push({ ch: '冬青黑体简', en: 'Hiragino Sans GB' });
      dataFont.push({ ch: '兰亭黑-简', en: 'Lantinghei SC' });
      dataFont.push({ ch: '翩翩体-简', en: 'Lantinghei SC' });
      dataFont.push({ ch: '手札体-简', en: 'Hannotate SC' });
      dataFont.push({ ch: '宋体-简', en: 'Songti SC' });
      // office
      dataFont.push({ ch: '幼圆', en: 'YouYuan' });
      dataFont.push({ ch: '隶书', en: 'LiSu' });
      dataFont.push({ ch: '华文细黑', en: 'STXihei' });
      dataFont.push({ ch: '华文楷体', en: 'STKaiti' });
      dataFont.push({ ch: '华文宋体', en: 'STSong' });
      dataFont.push({ ch: '华文仿宋', en: 'STFangsong' });
      dataFont.push({ ch: '华文中宋', en: 'STZhongsong' });
      dataFont.push({ ch: '华文彩云', en: 'STCaiyun' });
      dataFont.push({ ch: '华文琥珀', en: 'STHupo' });
      dataFont.push({ ch: '华文新魏', en: 'STXinwei' });
      dataFont.push({ ch: '华文隶书', en: 'STLiti' });
      dataFont.push({ ch: '华文行楷', en: 'STXingkai' });
      dataFont.push({ ch: '方正舒体', en: 'FZShuTi' });
      dataFont.push({ ch: '方正姚体', en: 'FZYaoti' });
      this.systemFont = [];
      this._systemFontMap = {};
      dataFont.forEach((element) => {
        const result: boolean = this.isSupportFontFamily(element.en);
        if (result === true) {
          this.systemFont.push(element.en);
          this._systemFontMap[element.en.toLowerCase()] = element;
          // this._systemFontMap[element.ch.toLowerCase()] = element;
        }
      });
      return this.systemFont;
    }

    // 字体映射表
    public static get fontMap(): { [type: string]: { ch: string, en: string } } {
      if (this._systemFontMap == null) {
        this.enumerateFonts();
      }
      return this._systemFontMap;
    }

    /** 获取字体的英文名称，不存在时返回null，比如：微软雅黑 返回（Microsoft Yahei） */
    public static GetFontFamilyNameEn(font: string): string {
      if (font != null) {
        const f = font.toLowerCase();
        if (this.fontMap.hasOwnProperty(f)) {
          const data: { ch: string, en: string } = this._systemFontMap[f];
          return data.en;
        }
      }
      return null;
    }

    /** 检测某个字体是否支持（支持返回true） */
    public static isSupportFontFamily(fontFamily: string) {
      if (typeof fontFamily !== 'string') {
        return false;
      }
      const fontDefault: string = 'Arial';
      if (fontFamily.toLowerCase() === fontDefault.toLowerCase()) {
        return true;
      }
      if (this.fontMap.hasOwnProperty(fontFamily.toLowerCase())) {
        return true;
      }
      const testStr = 'a';
      const fontSize = 100;
      const w = 100;
      const h = 100;
      if (this.canvas == null) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
      }
      this.canvas.width = w;
      this.canvas.height = h;
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = 'black';
      this.ctx.textBaseline = 'middle';
      const testFont = (j: string) => {
        this.ctx.clearRect(0, 0, w, h);
        this.ctx.font = `${fontSize}px ${j}, ${fontDefault}`;
        this.ctx.fillText(testStr, w / 2, h / 2);
        const uint8ClampedArray = this.ctx.getImageData(0, 0, w, h).data;
        return uint8ClampedArray.filter((value: number): boolean => value !== 0);
      };
      return testFont(fontDefault).join('') !== testFont(fontFamily).join('');
    }
}
