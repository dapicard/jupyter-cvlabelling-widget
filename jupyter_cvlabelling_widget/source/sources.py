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
Available sources
"""
import abc
import cv2
import glob
from PIL import Image
from ..model import DictSerializable

class WorkzoneSource(DictSerializable, metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def next(self):
        """
        Get the next image and returns it a a PIL Image
        """
        raise NotImplementedError('users must define next to use this base class')

class CV2VideoSource(WorkzoneSource):
    """
    A video Source, read using OpenCV
    """
    _capture = None

    def __init__(self, input):
        self._capture = cv2.VideoCapture(input)

    def next(self):
        """
        Get the next image
        """
        _, current_frame = self._capture.read()
        current_frame = cv2.cvtColor(current_frame, cv2.COLOR_BGR2RGB)
        return current_frame

class GlobSource(WorkzoneSource):
    """
    A glob Source, retrieving images from a glob expression and reading it using OpenCV
    """

    _glob = None
    _index = None

    def __init__(self, glob_expression):
        self._glob = glob.glob(glob_expression)
        self._index = 0

    def next(self):
        """
        Get the next image
        """
        current_frame = cv2.imread(self._glob[self._index])
        self._index += 1
        current_frame = cv2.cvtColor(current_frame, cv2.COLOR_BGR2RGB)
        return current_frame