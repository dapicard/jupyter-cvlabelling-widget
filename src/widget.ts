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

import { DOMWidgetModel, DOMWidgetView, ISerializers } from '@jupyter-widgets/base';
import { MODULE_NAME, MODULE_VERSION } from './version';
import SVG from 'svg.js';

import { Configuration } from './model/configuration';
import { LabellingFunction } from './function/labellingfunction';
import { ClassifyFunction } from './function/classify';
import { CaptureAndClassifyFunction } from './function/captureandclassify';

export class WorkzoneModel extends DOMWidgetModel {
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
      image_height: 768,
      capture_shape: {}
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


export class WorkzoneView extends DOMWidgetView {
  keyboard_input: HTMLElement;
  configuration: Configuration;
  draw: SVG.Doc;
  image: SVG.Image;
  focused_element: HTMLElement;
  labellingFunction: LabellingFunction;
  ratio = 1.0;

  initialize(parameters: any): void {
    console.log("initialize")
    this._setElement(document.createElement("div"));
  }

  _handle_click(event: any){
    event.preventDefault();
    this.send({event: 'next'});
    // Do it twice as sometimes a single call is not sufficient
    this.keyboard_input.focus({preventScroll: true});
    this.keyboard_input.focus({preventScroll: true});
  }

  _get_focus(event: MouseEvent) {
    event.preventDefault();
    // Keep track of the focused element
    this.focused_element = <HTMLElement>document.activeElement;
    // Do it twice as sometimes a single call is not sufficient
    this.keyboard_input.focus({preventScroll: true});
    this.keyboard_input.focus({preventScroll: true});
  }

  _leave_focus(event: MouseEvent) {
    // Back to the focused element
    this.focused_element.focus({preventScroll: true});
  }
  
  render() {
    super.render();
    this.update_configuration();
    
    // An input element that will be used to get keyboard events
    this.keyboard_input = document.createElement('input');
    this.keyboard_input.setAttribute('type', 'text');
    this.keyboard_input.style.position = 'absolute';
    this.keyboard_input.style.zIndex = '-1';
    this.keyboard_input.style.width = '1px';
    this.keyboard_input.style.height = '1px';
    this.el.appendChild(this.keyboard_input);

    // The drawing zone
    const drawing = document.createElement("div");
    this.el.appendChild(drawing);
    this.draw = SVG(drawing);

    // The image to display
    this.image = this.draw.image();
    this.image.on('mouseover', this._get_focus, this);
    this.image.on('mouseout', this._leave_focus, this);

    this.model.on('change:configuration', this.update_configuration, this);
    this.model.on('change:image', this.update_image, this);
    
    this.labellingFunction.initialize(this.configuration.function, this, this.draw);

    const view = this;
    this.image.on('mousemove', function(event: MouseEvent) {
      this.labellingFunction.handle_mousemove(event, view.image);
    }, this);
    this.image.on('DOMMouseScroll mousewheel', function(event: MouseWheelEvent) {
      this.labellingFunction.handle_mousewheel(event, view.image);
    }, this)
    this.keyboard_input.addEventListener('keypress', function(ev: KeyboardEvent) {
      view.labellingFunction.handle_keypress(ev);
    });
    drawing.addEventListener("click", function(ev: MouseEvent) {
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
    } else {
      this.image.size(this.model.get('image_width'), this.model.get('image_height'));
    }
    this.image.scale(this.ratio);
    this.draw.size(this.model.get('image_width')*this.ratio, this.model.get('image_height')*this.ratio);
    this.labellingFunction.update_image(this.image);
  }

  update_configuration() {
    this.configuration = JSON.parse(this.model.get('configuration'));
    const functionName: string = this.configuration.function.class;
    console.log(functionName);
    switch(functionName) {
      case 'Classify':
        this.labellingFunction = new ClassifyFunction();
        break;
      case 'CaptureAndClassify':
        this.labellingFunction = new CaptureAndClassifyFunction();
        break;
    }
  }
}
