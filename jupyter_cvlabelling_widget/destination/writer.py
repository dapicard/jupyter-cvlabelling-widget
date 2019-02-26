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
Module that contains common interface and basic implementations of stores
"""
import abc
import os
import pathlib
import glob
from parse import parse
from PIL import Image

class ClassifyStore(object, metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def append(self, image_capture, label):
        raise NotImplementedError('users must define append to use this base class')

    @abc.abstractmethod
    def delete_latest(self, capture_index, label):
        raise NotImplementedError('users must define delete_latest to use this base class')

class FileSystemClassifyStore(ClassifyStore):
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
            for f in list(glob.glob(folder_path + '/' + label + '/' + filename_pattern.format('[0-9]*'))):
                f_index = int(parse(folder_path + '/' + label + '/' + filename_pattern, f)[0])
                if f_index > i:
                    i = f_index
            self.last_inserted[label] = i

    def append(self, image_capture, label):
        """
        Store the image on the folder

        image_capture : array representing the capture to store
        label : capture label (classification)
        """
        image = Image.fromarray(image_capture)
        image.save(self.folder_path + '/' + label + '/' + self.filename_pattern.format(self.last_inserted[label]+1), format=self.image_format)
        self.last_inserted[label] += 1

    def delete_latest(self, capture_index, label):
        """
        Delete the n-th latest capture, where capture_index is the reverse index to delete :
          0 - delete the latest capture
          -1 - delete the previous one
          and so on...
        capture_index : n-th latest index to delete
        label : capture label (classification)
        """
        to_delete = self.last_inserted[label] + capture_index
        if to_delete >= 0:
            os.remove(self.folder_path + '/' + label + '/' + self.filename_pattern.format(to_delete))