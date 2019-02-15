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


import { WidgetView, WidgetModel } from '@jupyter-widgets/base';
import SVG from 'svg.js';

import { LabellingFunction } from './labellingfunction';
import { ShapeType } from '../model/shape';
import { CaptureAndClassify } from '../model/functions';


export class CaptureAndClassifyFunction implements LabellingFunction {
  configuration: CaptureAndClassify;
  view: WidgetView;
  model: WidgetModel;
  draw: SVG.Doc;
  capture_shape: SVG.Rect;

  initialize(configuration: any, view: WidgetView, draw: SVG.Doc) {
    this.configuration = configuration;
    this.draw = draw;
    this.view = view;
    this.model = view.model;
    if(this.configuration.capture_shape.shape_type == ShapeType.RECT) {
      this.capture_shape = this.draw.rect(this.configuration.capture_shape.width, this.configuration.capture_shape.height);
    }
    this.capture_shape.attr('stroke', 'green');
    this.capture_shape.attr('fill', 'none');
  }

  handle_keypress(event: KeyboardEvent) {
    event.preventDefault();
    if(Object.keys(this.configuration.keyclass_binding).indexOf(event.code) > -1) {
      const msg = {
        event: 'capture',
        label: this.configuration.keyclass_binding[event.code],
        shape: this.configuration.capture_shape.shape_type,
        shape_size: {width: this.configuration.capture_shape.width, height: this.configuration.capture_shape.height},
        center: {x: Math.round(this.capture_shape.cx()), y: Math.round(this.capture_shape.cy())}
      }
      this.view.send(msg);
    }
  }

  handle_mousemove(event: MouseEvent, image: SVG.Image) {
    event.preventDefault();
    let point = this.draw.point();
    point.x = event.clientX;
    point.y = event.clientY;
    const p2 = point.transform(image.screenCTM().inverse());
    this.capture_shape.cx(p2.x);
    this.capture_shape.cy(p2.y);
  }

  update_image(image: SVG.Image) {
    this.capture_shape.transform(image.transform());
  }
}
