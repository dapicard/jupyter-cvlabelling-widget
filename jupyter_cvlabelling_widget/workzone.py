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

import base64
from io import BytesIO
import cv2
from PIL import Image
from ipywidgets import DOMWidget
from traitlets import Unicode, Int, Instance
from .model import Configuration, DictSerializable
from ._frontend import module_name, module_version
from .writer import ClassifyStore


class WorkzoneWidget(DOMWidget):
    """Main workzone widget
    """
    _model_name = Unicode('WorkzoneModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('WorkzoneView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    image = Unicode('').tag(sync=True)
    image_width = Int(1024).tag(sync=True)
    image_height = Int(768).tag(sync=True)
    configuration = Instance(Configuration).tag(sync=True, to_json=DictSerializable.to_json)

    capture = None
    current_frame = None

    def __init__(self, **kwargs):
        self.configuration = Configuration()
        super(WorkzoneWidget, self).__init__(**kwargs)
        self.on_msg(self._handle_messages)

    def grab_image(self):
        if(self.capture.isOpened()):
            ret, self.current_frame = self.capture.read()
            height, width = self.current_frame.shape[:2]
            rgb = cv2.cvtColor(self.current_frame, cv2.COLOR_BGR2RGB)
            im = Image.fromarray(rgb)
            buffered = BytesIO()
            im.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue())
            self.image = "data:image/png;base64," + img_str.decode("utf-8")
            self.image_width = width
            self.image_height = height

    def _handle_messages(self, _, content, buffers):
        """Handle a msg from the front-end.

        Parameters
        ----------
        content: dict
            Content of the msg.
        """
        if content['event'] == 'click':
            self.grab_image()
        else:
            self.configuration.function.apply(content, self.current_frame)
