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
Available functions
"""
import abc
import cv2
from ..writer import ClassifyStore
from ..model import DictSerializable
from ..model import Shape

class WorkzoneFunction(DictSerializable, metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def apply(self, content, frame):
        """
        Apply the action
        """
        raise NotImplementedError('users must define apply to use this base class')

class CaptureAndClassify(WorkzoneFunction):
    """
    Capture and classify function, defining a capture shape and a key to classname binding
    """
    capture_shape: Shape = None
    keyclass_binding = None
    latest_pool_size = None
    _store: ClassifyStore = None

    def __init__(self, store, shape=Shape(), keyclass_binding={'KeyC': 'capture'}, latest_pool_size=10):
        self._store = store
        self.capture_shape = shape
        self.keyclass_binding = keyclass_binding
        self.latest_pool_size = latest_pool_size

    def apply(self, content, frame):
        """
        Apply the action
        """
        if content['event'] == 'capture':
            # Extract the image given the shape
            zone = None
            h, w = frame.shape[:2]
            if(content['shape'] == 'RECT'):
                width = content['shape_size']['width']
                height = width = content['shape_size']['height']
                top = max(content['center']['y'] - int(height/2), 0)
                left = max(content['center']['x'] - int(width/2), 0)
                zone = frame[top:min(top+height, h), left:min(left+width, w)]
            self._store.append(cv2.cvtColor(zone, cv2.COLOR_BGR2RGB), content['label'])
        elif content['event'] == 'delete_capture':
            # Delete the n-th latest capture
            self._store.delete_latest(content['index'], content['label'])