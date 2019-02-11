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
Shape description
"""
from enum import EnumMeta
from .serializable import DictSerializable

class ShapeType(EnumMeta):
    """
    Shape types enumeration
    """
    RECT = "RECT"

class Shape(DictSerializable):
    """
    Describe a shape, used to capture some content
    """
    shape_type: ShapeType = None
    width = 0
    height = 0

    def __init__(self, shape_type=ShapeType.RECT, width=25, height=25):
        self.shape_type = shape_type
        self.width = width
        self.height = height

