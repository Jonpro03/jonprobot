import requests
import json
import shutil
import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
import cv2
from datetime import datetime
from multiprocessing import Process
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
from os.path import exists
import gc

from dotenv import dotenv_values
from pymongo import MongoClient, UpdateOne
from pymongo.errors import BulkWriteError

config = dotenv_values(".env")

mongo = MongoClient(config["DB_CONNECT_STR"])
posts_db = mongo['reddit_posts']

def update_database(sub):
    last = None
    breakout = False
    headers = {'User-Agent': 'jonprobot/0.0.1'}
    sub_table = posts_db[sub]
    already_processed_count = 0
    while breakout is False:
        url = f"https://www.reddit.com/r/{sub}/new.json?limit=100&t=week"
        if last is not None:
            url += f"&after={last}"
        new_by_day = requests.get(url, headers=headers)

        if new_by_day.status_code != 200:
            exit()

        poasts = json.loads(new_by_day.content)["data"]["children"]

        if len(poasts) == 100:
            last = poasts[99]["data"]["name"]
        else:
            breakout = True

        posts = []
        for poast in poasts:
            post = poast["data"]

            # x-ref DB to see if we've already processed this one
            if sub_table.find_one({"_id": post['id']}) is not None:
                already_processed_count += 1
                continue

            post['_id'] = post['id']
            post["image_text"] = ""
            post["img_path"] = ""
            post["post_type"] = "new"
            posts.append(post)
            print(f"Adding {post['permalink']}")
        if posts:
            try:
                sub_table.insert_many(posts)
            except BulkWriteError as e:
                posts = [UpdateOne({'_id':x['_id']}, {'$setOnInsert':x}, upsert=True) for x in posts]
                sub_table.bulk_write(posts)
        if already_processed_count > 10:
            break

def download_images(sub):
    headers = {'User-Agent': 'jonprobot/0.0.1'}

    sub_table = posts_db[sub]
    posts = sub_table.find({"post_type": "new"})
    for post in posts:
        if post["img_path"] != '' or post["is_video"]:
            continue
        if post["selftext"] != "":
            continue
        img_url = post["url"]
        if "http" not in img_url:
            continue
        
        img_ext = img_url.split('.')[-1]
        if img_ext not in ['png', 'jpg', 'jpeg', 'bmp']:
            continue
        post_id = post["id"]
        img_path = f"images/{post_id}.{img_ext}"

        if not exists(img_path):
            img_req = requests.get(img_url, stream=True, headers=headers)
            img_req.raw.decode_content = True
            with open(img_path, "wb") as f:
                shutil.copyfileobj(img_req.raw, f)
        
        post["img_path"] = img_path
        post["post_type"] = "unprocessed"
        sub_table.update_one({"_id": post['id']}, {"$set": post})
    

def pull_text_from_image(sub):
    sub_table = posts_db[sub]
    posts = sub_table.find({"post_type": "unprocessed"})
    for post in posts:
        if not exists(post["img_path"]):
            print(f'{post["img_path"]} not found.')
            post["post_type"] = "failed"
        else:
            img = cv2.imread(post["img_path"])
            # extract the text from the image
            try:
                text = pytesseract.image_to_string(img, timeout=30)
            except Exception as e:
                print(f"Failed on {post['permalink']} - {e}")
                with open("ocr_failures.txt", "a", encoding="utf-8") as f:
                    f.write("https://reddit.com"+post["permalink"]+'\n')
                text = "failed"
            post["image_text"] = text
            post["post_type"] = "unclassified"
        sub_table.update_one({"_id": post['id']}, {"$set": post})

def classify_data(sub):
    portfolio_posts = share_posts = purchase_posts = donation_posts = 0
    sub_table = posts_db[sub]
    posts = list(sub_table.find({"post_type": "unclassified"}))
    print(f'{len(posts)} {sub} posts to classify.')
    for post in posts:
        img_text = post["image_text"]
        if "(DRS)" in img_text or "Portfolio" in img_text or "class a" in img_text.lower() or "Investment Summary" in img_text or 'Dtc Stock' in img_text:
            post["post_type"] = "portfolio"
            sub_table.update_one({"_id": post['id']}, {"$set": post})
            portfolio_posts += 1
            print(f'portfolio: {post["permalink"]}')
        elif "DirectStock" in img_text or "One Time" in img_text:
            post["post_type"] = "purchase"
            sub_table.update_one({"_id": post['id']}, {"$set": post})
            share_posts += 1
            print(f'purchase: {post["permalink"]}')
        else:
            post["post_type"] = "unknown"
            sub_table.update_one({"_id": post['id']}, {"$set": post})
        
    print (f'{share_posts} share posts in {sub}.')
    print (f'{portfolio_posts} portfolio posts in {sub}.')
    print (f'{purchase_posts} purchase posts in {sub}.')


def update_posts(sub):
    print(f"Getting new posts from {sub}")
    update_database(sub)
    gc.collect()
    print(f"Getting post images from {sub}")
    download_images(sub)
    gc.collect()
    print(f"Getting text from images for {sub}.")
    pull_text_from_image(sub)
    print(f"Classifying {sub} posts.")
    classify_data(sub)
    print(f'{sub} finished.')

if __name__ == '__main__':
    procs = [
        Process(target=update_posts, args=("Superstonk",)),
        Process(target=update_posts, args=("GME",)),
        Process(target=update_posts, args=("GMEJungle",)),
        Process(target=update_posts, args=("GME_Computershare",)),
        Process(target=update_posts, args=("infinitypool",)),
        Process(target=update_posts, args=("GMEOrphans",)),
        Process(target=update_posts, args=("DDintoGME",)),
        Process(target=update_posts, args=("Spielstopp",)),
        Process(target=update_posts, args=("GMECanada",)),
        Process(target=update_posts, args=("DRSyourGME",))
    ]

    for proc in procs:
        proc.start()
    
    for proc in procs:
        proc.join()
