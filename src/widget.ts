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

import {
  DOMWidgetModel, DOMWidgetView, ISerializers
} from '@jupyter-widgets/base';

import {
  MODULE_NAME, MODULE_VERSION
} from './version';

// import * as svg from 'svg.js';
import SVG from 'svg.js';


export
class WorkzoneModel extends DOMWidgetModel {
  defaults() {
    return {...super.defaults(),
      _model_name: WorkzoneModel.model_name,
      _model_module: WorkzoneModel.model_module,
      _model_module_version: WorkzoneModel.model_module_version,
      _view_name: WorkzoneModel.view_name,
      _view_module: WorkzoneModel.view_module,
      _view_module_version: WorkzoneModel.view_module_version,
      image : '',
      image_width: 1024,
      image_height: 768
    };
  }

  static serializers: ISerializers = {
      ...DOMWidgetModel.serializers,
      // Add any extra serializers here
    }

  static model_name = 'WorkzoneModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'WorkzoneView';   // Set to null if no view
  static view_module = MODULE_NAME;   // Set to null if no view
  static view_module_version = MODULE_VERSION;
}


export
class WorkzoneView extends DOMWidgetView {
  keyboard_input: HTMLElement;
  draw: SVG.Doc;
  image: SVG.Image;
  capture_shape: SVG.Rect;
  focused_element: HTMLElement;
  ratio = 1.0;

  initialize(parameters: any): void {
    console.log("initialize")
    this._setElement(document.createElement("div"));
  }

  _handle_click(event: any){
    event.preventDefault();
    this.send({event: 'click'});
  }

  _handle_keypress(event: KeyboardEvent) {
    event.preventDefault();
    switch(event.code) {
    case 'KeyC':
      const msg = {
        event: 'capture',
        shape: 'RECT',
        shape_size: {width: 25, height: 25},
        center: {x: Math.round(this.capture_shape.cx()), y: Math.round(this.capture_shape.cy())}
      }
      this.send(msg);
      break;
    }
  }

  _get_focus(event: MouseEvent) {
    event.preventDefault();
    // Keep track of the focused element
    this.focused_element = <HTMLElement>document.activeElement;
    // Do it twice as sometimes a single call is not sufficient
    this.keyboard_input.focus();
    this.keyboard_input.focus();
  }

  _leave_focus(event: MouseEvent) {
    // Back to the focused element
    this.focused_element.focus();
  }

  draw_capture_rectangle(event) {
    event.preventDefault();
    let point = this.draw.point();
    point.x = event.clientX;
    point.y = event.clientY;
    console.log("before", point);
    const p2 = point.transform(this.image.screenCTM().inverse());
    console.log("after", p2);
    this.capture_shape.cx(p2.x*this.ratio);
    this.capture_shape.cy(p2.y*this.ratio);
  }
  
  render() {
    super.render();
    
    // An input element that will be used to get keyboard events
    this.keyboard_input = document.createElement('input');
    this.keyboard_input.setAttribute('type', 'text');
    this.el.appendChild(this.keyboard_input);
    this.keyboard_input.addEventListener('keypress', function(ev: KeyboardEvent) {
      view._handle_keypress(ev);
    });

    // The drawing zone
    const drawing = document.createElement("div");
    this.el.appendChild(drawing);
    this.draw = SVG(drawing);

    // The image to display
    this.image = this.draw.image();
    this.image.on('mouseover', this._get_focus, this);
    this.image.on('mouseout', this._leave_focus, this);
    this.image.on('mousemove', this.draw_capture_rectangle, this);

    // The capture shape, that will follow the mouse on the image
    this.capture_shape = this.draw.rect(25,25);
    this.capture_shape.attr('stroke', 'green');
    this.capture_shape.attr('fill', 'none');

    this.model.on('change:image', this.update_image, this);
    
    const view = this;
    this.el.addEventListener("click", function(ev: MouseEvent) {
      view._handle_click(ev);
    });
    (<HTMLElement>this.el).addEventListener("DOMNodeInserted", function(event) {
      view.update_image();
    });
    
  }

  update_image() {
    this.image.load(this.model.get('image'));
    const displayWidth: number = (<HTMLElement>this.el).offsetWidth;
    const imageWidth: number = this.model.get('image_width');
    this.ratio = 1.0;
    if(displayWidth < imageWidth) {
      this.ratio = Math.round(displayWidth / imageWidth*100)/100;
    }
    // ratio = 0.5;
    this.image.scale(this.ratio);
    this.capture_shape.size(25*this.ratio, 25*this.ratio);
    this.draw.size(this.model.get('image_width')*this.ratio, this.model.get('image_height')*this.ratio);
    //this.image.size(this.model.get('image_width')*ratio, this.model.get('image_height')*ratio);
  }
}
