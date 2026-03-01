import json


class JsonUtil:
    @staticmethod
    def read_json(path: str):
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
