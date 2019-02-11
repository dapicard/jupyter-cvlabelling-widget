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
from .serializable import DictSerializable
from .shape import Shape

class CaptureAndClassify(DictSerializable):
    """
    Capture and classify function, defining a capture shape and a key to classname binding
    """
    capture_shape: Shape = None
    keyclass_binding = None

    def __init__(self, shape=Shape(), keyclass_binding={'KeyC': 'capture'}):
        self.capture_shape = shape
        self.keyclass_binding = keyclass_binding