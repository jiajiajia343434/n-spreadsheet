import DropdownItem from './dropdown_item';
import DropdownFont from '../dropdown_font';

export default class Font extends DropdownItem {
  constructor() {
    super('font-name');
  }

  getValue(it) {
    return it.title;
  }

  dropdown() {
    return new DropdownFont();
  }
}
