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
import { Classify } from '../model/functions';


export class ClassifyFunction implements LabellingFunction {
  configuration: Classify;
  view: WidgetView;
  model: WidgetModel;
  draw: SVG.Doc;
  current_image: SVG.Image;
  latest_captures: HTMLDivElement;
  protected current_capture_index: {[key:string]: number};

  initialize(configuration: any, view: WidgetView, draw: SVG.Doc) {
    this.configuration = configuration;
    this.draw = draw;
    this.view = view;
    this.model = view.model;
    
    // Create latest captures toolbar
    this.latest_captures = document.createElement('div');
    this.latest_captures.setAttribute('id', 'latest_captures');
    this.view.el.appendChild(this.latest_captures);

    this.current_capture_index = {};
    for(let key in this.configuration.keyclass_binding) {
      this.current_capture_index[this.configuration.keyclass_binding[key]] = 0;
    }
  }

  handle_keypress(event: KeyboardEvent) {
    event.preventDefault();
    if(Object.keys(this.configuration.keyclass_binding).indexOf(event.code) > -1) {
      const msg = {
        event: 'capture',
        label: this.configuration.keyclass_binding[event.code],
      }
      this.view.send(msg);
      this.view.send({event: 'next'});
      this.current_capture_index[msg.label]++;
      // Add the capture to the latest captures pool
      this.addCapture(this.current_image.attr('href'), msg.label);
    }
  }

  handle_mousemove(event: MouseEvent, image: SVG.Image) {}

  handle_mousewheel(event: MouseWheelEvent, image: SVG.Image) {}

  update_image(image: SVG.Image) {
    this.current_image = image;
  }

  protected addCapture(dataUrl: string, label: string) {
    const widget = this;
    const img = document.createElement('img');
    img.src = dataUrl;
    img.title = label;
    
    const div = document.createElement('div');
    div.style.display = 'inline';
    div.style.position = 'relative';
    div.style.marginRight = '8px';
    div.appendChild(img);

    const close = document.createElement('button');
    close.style.position = 'absolute';
    close.style.backgroundColor = 'white';
    close.style.bottom = '0px';
    close.style.right = '-5px';
    close.style.color = 'red';
    close.style.border = 'none';
    close.style.width = '12px';
    close.style.height = '15px';
    close.style.padding = '0px';
    close.style.margin = '0px';
    close.title = 'Remove this capture';
    const capture_index = this.current_capture_index[label];
    close.addEventListener('click', function(ev: Event) {
      widget.handle_delete_capture(div, label, capture_index);
      
    });
    const icon = document.createElement('span');
    icon.className = 'fa fa-window-close';
    close.appendChild(icon);
    div.appendChild(close);

    if(this.latest_captures.childElementCount >= this.configuration.latest_pool_size) {
      this.latest_captures.removeChild(this.latest_captures.firstChild);
    }
    this.latest_captures.appendChild(div);
  }

  handle_delete_capture(div: HTMLDivElement, label: string, index: number) {
    // Send a message to delete the n-th latest capture
    // 0 is the latest capture
    // -1 is the previous one
    // and so on
    const msg = {
      event: 'delete_capture',
      label: label,
      index: (index - this.current_capture_index[label])
    }
    this.view.send(msg);
    this.latest_captures.removeChild(div);
  }
}
