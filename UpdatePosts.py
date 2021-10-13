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

def update_database(sub):
    last = None
    breakout = False
    headers = {'User-Agent': 'jonprobot/0.0.1'}
    while breakout is False:
        with tinydb.TinyDB(f"{sub}.json", storage=CachingMiddleware(JSONStorage)) as db:
            url = f"https://www.reddit.com/r/{sub}/new.json?limit=100&t=hour"
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

            already_processed_count = 0

            for poast in poasts:
                post = poast["data"]

                # x-ref DB to see if we've already processed this one
                q = tinydb.Query()
                if len(db.search(q.name == post["name"])) > 0:
                    already_processed_count += 1
                    if already_processed_count > 10:
                        return
                    continue
                post["image_text"] = ""
                post["img_path"] = ""
                post["post_type"] = ""
                db.insert(post)
                print(f"Adding {post['permalink']}")
            print(f"{sub} DB records: {len(db)}")

def download_images(sub):
    headers = {'User-Agent': 'jonprobot/0.0.1'}
    with tinydb.TinyDB(f"{sub}.json", storage=CachingMiddleware(JSONStorage)) as db:
        db.storage.WRITE_CACHE_SIZE = 300
        for post in db:
            if post["img_path"] != "" or post["is_video"]:
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

            img_req = requests.get(img_url, stream=True, headers=headers)
            img_req.raw.decode_content = True
            with open(img_path, "wb") as f:
                shutil.copyfileobj(img_req.raw, f)
            
            post["img_path"] = img_path
            db.update(post, doc_ids=[post.doc_id])
            #db.update({post.doc_id: post})

def pull_text_from_image(sub):
    q = tinydb.Query()
    with tinydb.TinyDB(f"{sub}.json", storage=CachingMiddleware(JSONStorage)) as db:
        for post in db.search(~(q.img_path=="") & (q.image_text=="")):
            if post["id"] == "ps786k":
                print("Found it")
            if not exists(post["img_path"]):
                print(f'{post["img_path"]} not found.')
                post["image_text"] = "failed"
            else:
                img = cv2.imread(post["img_path"])
                # extract the text from the image
                try:
                    text = pytesseract.image_to_string(img, timeout=12)
                except Exception as e:
                    print(f"Failed on {post['permalink']} - {e}")
                    text = "failed"
                post["image_text"] = text
            db.update(post, doc_ids=[post.doc_id])

def classify_data(sub):
    portfolio_posts = share_posts = purchase_posts = 0
    q = tinydb.Query()
    db = tinydb.TinyDB(f"{sub}.json", storage=CachingMiddleware(JSONStorage))
    posts = db.search(~(q.image_text=="") & (q.post_type==""))
    #posts = db.search(~(q.image_text=="") & ((q.post_type=="") | (q.post_type=="unclassified")))
    #posts = db.search(q.id == "ptbm1g")
    print(f'{len(posts)} {sub} posts to classify.')
    for post in posts:
        if post["id"] == "pynt78":
            print("Found it")
        img_text = post["image_text"]
        if "Portfolio" in img_text or "class a" in img_text.lower() or "Investment Summary" in img_text or 'Dtc Stock' in img_text:
            post["post_type"] = "portfolio"
            db.update(post, doc_ids=[post.doc_id])
            portfolio_posts += 1
            print(f'portfolio: {post["permalink"]}')
            continue
        elif "DirectStock" in img_text or "One Time" in img_text:
            post["post_type"] = "shares"
            db.update(post, doc_ids=[post.doc_id])
            share_posts += 1
            print(f'shares: {post["permalink"]}')
            continue
        elif "PRODUCTS" in img_text or "PURCHASES" in img_text or "Subtotal" in img_text:
            post["post_type"] = "purchase"
            db.update(post, doc_ids=[post.doc_id])
            purchase_posts += 1
            print(f'purchases: {post["permalink"]}')
            continue
        else:
            if post["post_type"] != "unclassified":
                post["post_type"] = "unclassified"
                db.update(post, doc_ids=[post.doc_id])
            print(f'unclassified: {post["permalink"]}')
    print (f'{share_posts} share posts in {sub}.')
    print (f'{portfolio_posts} portfolio posts in {sub}.')
    print (f'{purchase_posts} purchase posts in {sub}.')
    db.close()
    del db
    

def share_results(sub):
    results = "Value|/u|Post\n:--:|:--:|:--:\n"
    db = tinydb.TinyDB(f"{sub}.json")
    q = tinydb.Query()
    for post in db.search(q.post_type=="shares"):
        lines = post["image_text"].splitlines()
        for line in lines:
            if "$" in line.lower():
                value = "$"+"".join(c for c in line if c.isdigit() or c == ".")
                url = "[Post](https://reddit.com"+post["permalink"]+")"
                results += f'{value}|{post["author"]}|{url}\n'
                continue
    with open("results.txt", "a", encoding="utf-8") as f:
        f.writelines(results)

def purchase_results(sub):
    results = "Value|/u|Post\n:--:|:--:|:--:\n"
    db = tinydb.TinyDB(f"{sub}.json")
    q = tinydb.Query()
    for post in db.search(q.post_type=="purchase"):
        lines = post["image_text"].splitlines()
        for line in lines:
            if "total" in line.lower():
                value = line.split('$')[-1]
                url = "[Post](https://reddit.com"+post["permalink"]+")"
                results += f'${value}|{post["author"]}|{url}\n'
                continue
    with open("purchase_results.txt", "a", encoding="utf-8") as f:
        f.writelines(results)

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
        Process(target=update_posts, args=("wallstreetbets",)),
        Process(target=update_posts, args=("GME_Computershare",)),
        Process(target=update_posts, args=("amcstock",)),
        Process(target=update_posts, args=("DDintoGME",))
    ]

    for proc in procs:
        proc.start()
    
    for proc in procs:
        proc.join()
