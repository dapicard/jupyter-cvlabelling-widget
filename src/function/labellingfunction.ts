//     Copyright (C) 2019  Damien Picard

//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU Affero General Public License as
//     published by the Free Software Foundation, either version 3 of the
//     License, or (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU Affero General Public License for more details.

//     You should have received a copy of the GNU Affero General Public License
//     along with this program.  If not, see <https://www.gnu.org/licenses/>.


import { WidgetView } from '@jupyter-widgets/base';
import SVG from 'svg.js';

export interface LabellingFunction {

  initialize(configuration: any, view: WidgetView, draw: SVG.Doc);

  handle_mousemove(event: MouseEvent, image: SVG.Image);

  handle_mousewheel(event: MouseWheelEvent, image: SVG.Image);

  handle_keypress(event: KeyboardEvent);

  update_image(image: SVG.Image);
}