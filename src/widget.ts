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
      image : ''
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
  
  initialize(parameters: any): void {
    this._setElement(document.createElement("img"));
  }

  _handle_click(event: any){
    event.preventDefault();
    this.send({event: 'click'});
  }
  
  render() {
    super.render();
    this.model.on('change:image', this.value_changed, this);
    
    const view = this;
    this.el.addEventListener("click", function(ev: MouseEvent) {
      view._handle_click(ev);
    });
    this.value_changed();
  }

  value_changed() {
    this.el.setAttribute("src", this.model.get('image'));
  }
}
