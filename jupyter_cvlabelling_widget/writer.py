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
Module that contains common interface and basic implementations of capture stores
"""
import abc
import os
import pathlib
from PIL import Image

class CaptureStore(object, metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def append(self, image_capture, label):
        raise NotImplementedError('users must define __str__ to use this base class')


class FileSystemCaptureStore(CaptureStore):
    """
    Store captures in a FS folder
    """
    folder_path = None
    filename_pattern = None
    last_inserted = {}
    image_format = None

    def __init__(self, folder_path, filename_pattern, labels, image_format="PNG"):
        self.folder_path = folder_path
        self.filename_pattern = filename_pattern
        self.image_format = image_format
        for label in labels:
            i = 0
            pathlib.Path(folder_path + '/' + label).mkdir(parents=True, exist_ok=True)
            while os.path.exists(folder_path + '/' + label + '/' + filename_pattern % (i + 1)):
                i += 1
            self.last_inserted[label] = i

    def append(self, image_capture, label):
        """
        Store the image on the folder

        image_capture : array representing the capture to store
        label : capture label (classification)
        """
        image = Image.fromarray(image_capture)
        image.save(self.folder_path + '/' + label + '/' + self.filename_pattern % (self.last_inserted[label]+1), format=self.image_format)
        self.last_inserted[label] += 1
