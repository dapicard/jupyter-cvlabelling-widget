#!/usr/bin/env python
# coding: utf-8

#  Copyright (C) 2019  Damien Picard

#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as
#  published by the Free Software Foundation, either version 3 of the
#  License, or (at your option) any later version.

#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.

#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""
Module that provides the widgets to label images sets (from globs to videos)
"""

from ipywidgets import DOMWidget
from traitlets import Unicode
from ._frontend import module_name, module_version
import cv2
import base64
from io import BytesIO
from PIL import Image


class WorkzoneWidget(DOMWidget):
    """Main workzone widget
    """
    _model_name = Unicode('WorkzoneModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('WorkzoneView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    image = Unicode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAA3klEQVRIidXXOw6EIBAGYO/uEbwCDYXxIpNMxRG0tKOUf4sN+1BRYIHJmpAQI/MZMsDQERHmeW7aiAid77R6iAjLsjxh/6IFCuAbro1/xj7AtfB9zFO4NH4WKwiXwkMxLuFf8auxt3AufjcmCk7FY76NhmMDxv5gEnwXOGVWkuEQkJoHWfAeykm+bNiDucvt/2CRqRZJLpHlJLKBiGyZIoeEyLEoUgiIlD4ixV5p1BgDZoa1FlprMDO2batf0E/TBKUUhmHAOI7o+x7rur7hWoW8c+7Qf11hfKdlIyI8AOHxteZgXf1sAAAAAElFTkSuQmCC').tag(sync=True)
    capture = None

    def __init__(self, **kwargs):
        super(WorkzoneWidget, self).__init__(**kwargs)
        self.on_msg(self._handle_button_msg)

    def _handle_button_msg(self, _, content, buffers):
        """Handle a msg from the front-end.

        Parameters
        ----------
        content: dict
            Content of the msg.
        """
        if content.get('event', '') == 'click':
            if(self.capture.isOpened()):
                ret, frame = self.capture.read()
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                im = Image.fromarray(gray)
                buffered = BytesIO()
                im.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue())
                self.image = "data:image/png;base64," + img_str.decode("utf-8")