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
Generic serializable object
"""
import json

class DictSerializable(object):
    @staticmethod
    def to_json(value, widget):
        return json.dumps(DictSerializable.to_dict(value, 'class'))

    @staticmethod
    def to_dict(obj, classkey=None):
        if isinstance(obj, dict):
            data = {}
            for (k, v) in obj.items():
                data[k] = DictSerializable.to_dict(v, classkey)
            return data
        elif hasattr(obj, "_ast"):
            return DictSerializable.to_dict(obj._ast())
        elif hasattr(obj, "__iter__") and not isinstance(obj, str):
            return [DictSerializable.to_dict(v, classkey) for v in obj]
        elif hasattr(obj, "__dict__"):
            data = dict([(key, DictSerializable.to_dict(value, classkey))
                for key, value in obj.__dict__.items()
                if not callable(value) and not key.startswith('_')])
            if classkey is not None and hasattr(obj, "__class__"):
                data[classkey] = obj.__class__.__name__
            return data
        else:
            return obj