import requests
import json
import shutil
import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
import cv2
from datetime import datetime
from time import time
from multiprocessing import Process
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
from os.path import exists
import gc

def update_database(sub):
    headers = {'User-Agent': 'jonprobot/0.0.1'}
    with tinydb.TinyDB(f"{sub}_stats.json", storage=CachingMiddleware(JSONStorage)) as db:
        url = f"https://www.reddit.com/r/{sub}/about.json"
        sub_stats_req = requests.get(url, headers=headers)

        if sub_stats_req.status_code != 200:
            exit()

        stats = json.loads(sub_stats_req.content)["data"]
        timestamp = int(time())
        record = {
            "active_user_count": stats["active_user_count"],
            "subscribers": stats["subscribers"],
            "timestamp": timestamp
        }
        db.insert(tinydb.table.Document(record, doc_id=timestamp))


if __name__ == '__main__':
    update_database("Superstonk")
    update_database("GME")
    update_database("GMEJungle")
