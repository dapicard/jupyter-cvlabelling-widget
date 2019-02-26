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

import { ShapeType } from '../model/shape';
import { CaptureAndClassify } from '../model/functions';
import { ClassifyFunction } from './classify';


export class CaptureAndClassifyFunction extends ClassifyFunction {
  local_configuration: CaptureAndClassify;
  capture_shape: SVG.Rect;
  

  initialize(configuration: any, view: WidgetView, draw: SVG.Doc) {
    super.initialize(configuration, view, draw);
    this.local_configuration = configuration;

    if(this.local_configuration.capture_shape.shape_type == ShapeType.RECT) {
      this.capture_shape = this.draw.rect(this.local_configuration.capture_shape.width, this.local_configuration.capture_shape.height);
    }

    this.capture_shape.attr('stroke', 'red');
    this.capture_shape.attr('fill', 'none');
  }

  handle_keypress(event: KeyboardEvent) {
    event.preventDefault();
    if(Object.keys(this.configuration.keyclass_binding).indexOf(event.code) > -1) {
      const msg = {
        event: 'capture',
        label: this.configuration.keyclass_binding[event.code],
        shape: this.local_configuration.capture_shape.shape_type,
        shape_size: {width: this.capture_shape.width(), height: this.capture_shape.height()},
        center: {x: Math.round(this.capture_shape.cx()), y: Math.round(this.capture_shape.cy())}
      }
      this.view.send(msg);
      this.current_capture_index[msg.label]++;
      // Add the capture to the latest captures pool
      const img = new Image;
      img.onload = (event) => {
        const canvas = document.createElement('canvas');
        canvas.width = msg.shape_size.width;
        canvas.height = msg.shape_size.height;
        canvas.getContext('2d').drawImage(img,
          msg.center.x - msg.shape_size.width/2 ,msg.center.y - msg.shape_size.height / 2,
          msg.shape_size.width,msg.shape_size.height,
          0,0,
          msg.shape_size.width,msg.shape_size.height);
        this.addCapture(canvas.toDataURL(), msg.label);
      };
      img.src = this.current_image.attr('href');
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

  handle_mousewheel(event: MouseWheelEvent, image: SVG.Image) {
    event.preventDefault();
    if(event.detail < 0 || event.deltaY < 0) {
      const w = Math.max(this.capture_shape.width()-1, 1);
      const h = Math.max(this.capture_shape.height()-1, 1);
      this.capture_shape.size(w, h);
    } else {
      this.capture_shape.size(this.capture_shape.width()+1, this.capture_shape.height()+1);
    }
  }

  update_image(image: SVG.Image) {
    super.update_image(image);
    this.capture_shape.transform(image.transform());
  }
}
