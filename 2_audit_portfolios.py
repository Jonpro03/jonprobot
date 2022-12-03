from os import system, remove
from os.path import exists
import time
import hashlib
from shutil import copy
from datetime import datetime
from time import mktime
from pymongo import MongoClient
from dotenv import dotenv_values

config = dotenv_values(".env")
mongo = MongoClient(config["DB_CONNECT_STR"])
reddit_posts = mongo['reddit_posts']
portfolio_table = mongo["computershare_posts"]['portfolios']


def get_reddit_post(post_id):
    record = portfolio_table.find_one({"_id": post_id})
    if record:
        return record

    subs = [
        "GME",
        "Superstonk",
        "GMEJungle",
        "DDintoGME",
        "GME_Computershare",
        "infinitypool",
        "Spielstopp",
        "DRSyourGME",
        "GMECanada",
        "GMEOrphans"
    ]

    for sub in subs:
        sub_table = reddit_posts[sub]
        post = sub_table.find_one({"_id": post_id})

        if post:
            d = int(mktime(datetime.date(
                datetime.fromtimestamp(post["created"])).timetuple()))
            return {
                "id": post["id"],
                "_id": post["id"],
                "image_text": post["image_text"],
                "image_path": post["img_path"],
                "img_hash": "",
                "value": None,
                "delta_value": 0,
                "sub": post["subreddit"],
                "u": post["author"],
                "url": "https://reddit.com"+post["permalink"],
                "created": post["created"],
                "audited": False,
                "count_accounts": 1,
                "duped_by": [],
                "acct_date": d,
                "acct_num": 0,
                "deleted": False,
                "post_type": post['post_type']
            }
    return None


def print_post(post):
    print(f'ID: {post["id"]}')
    print(f'SubReddit: {post["sub"]}')
    print(f'Link: {post["url"]}')
    print(f'Author: {post["u"]}')
    print(f'Value: {post["value"]}')
    print(f'Acct#: {post["acct_num"]}')


def post_time(post):
    global earliest_update
    post_time = post["created"]
    if post_time < earliest_update:
        earliest_update = int(post_time)


def delete_post(post):
    post["deleted"] = True
    try:
        remove(post['image_path'])
    except:
        pass
    portfolio_table.update_one({"_id": post['id']}, {"$set": post})


def get_new_value(post):
    while True:
        ans = input("How many shares? ")
        value = None
        try:
            value = float(ans)
        except:
            continue
        post["value"] = value
        if value == 0:
            delete_post(post)
            return
        portfolio_table.update_one({"_id": post['id']}, {"$set": post})
        return


def audit_cv_failures():
    # select * from portfolio_table where value = nul and duped_by = [] and audited = false
    posts = list(portfolio_table.find({"$and": [
        {"audited": False},
        {"deleted": False},
        {"value": None},
        {"duped_by": []}
    ]}))

    print(f"{len(posts)} posts to audit.")
    processed = 0
    for post in posts:
        post["audited"] = True
        post_time(post)
        ignore_keywords = ["cohen", "vote", "amendment",
                           "halt", "luld", "outbound", "nyse", "transfer agent"]
        if any(kw in post["image_text"].lower() for kw in ignore_keywords):
            delete_post(post)
            continue
        if '.' in post["image_path"]:
            if not exists(post["image_path"]):
                delete_post(post)
                continue
            system(f"codium {post['image_path']}")
        print_post(post)
        ans = input(
            "Is this a Computershare portfolio with visible value? Y/n ")
        if 'n' in ans.lower():
            delete_post(post)
            continue
        get_new_value(post)
        processed += 1
        print(f"{processed}/{len(posts)}")


def manual_audit():

    while True:
        ans = input("Audit a record manually? Y/n ")
        if 'n' in ans.lower():
            break
        post_id = input("Post ID: ")
        if not post_id:
            continue
        post = get_reddit_post(post_id)
        if post is not None:
            post["audited"] = True
            post_time(post)
            if '.' in post["image_path"]:
                system(f"codium {post['image_path']}")
            print_post(post)
            ans = input(
                "What should change? Value | Delete | Skip | Accounts: ")
            if 's' in ans.lower():
                continue
            if 'v' in ans.lower():
                get_new_value(post)
            if 'd' in ans.lower():
                delete_post(post)
            if 'a' in ans.lower():
                ans = input("How many accounts?")
                num_accts = 1
                try:
                    num_accts = int(ans)
                except:
                    pass
                post['count_accounts'] = num_accts
                portfolio_table.update_one({"_id": post['id']}, {"$set": post})

        else:
            ans = input("Post not found. Add? ")
            if 'n' in ans.lower():
                continue
            post = {
                "id": post_id,
                "_id": post_id,
                "image_text": "None",
                "image_path": "None",
                "value": 0,
                "delta_value": 0,
                "sub": input("What subreddit? "),
                "u": input("Username? "),
                "url": input("URL? "),
                "created": time.time(),
                "audited": True,
                "img_hash": "None",
                "count_accounts": 1,
                "duped_by": [],
                "acct_date": int(mktime(datetime.date(datetime.now()).timetuple())),
                "acct_num": 0,
                "deleted": False
            }
            portfolio_table.insert_one(post)
            get_new_value(post)


def audit_all():
    posts = list(portfolio_table.find({"$and": [
        {"audited": False},
        {"deleted": False},
        {"value": {"$ne": 0}},
        {"duped_by": []}
    ]}))

    print(f"{len(posts)} posts to audit.")
    processed = 0
    for post in posts:
        post["audited"] = True
        post_time(post)
        portfolio_table.update_one({"_id": post['id']}, {"$set": post})
        system(f"codium {post['image_path']}")
        print(post["url"])
        ans = input(f"{post['value']} Audit this? Y/n ")
        if 'y' in ans.lower():
            get_new_value(post)
        processed += 1
        print(f"{processed}/{len(posts)}")


def hashfile(path, blocksize=65536):
    afile = open(path, 'rb')
    hasher = hashlib.md5()
    buf = afile.read(blocksize)
    while len(buf) > 0:
        hasher.update(buf)
        buf = afile.read(blocksize)
    afile.close()
    return hasher.hexdigest()


def identify_dupes():
    identified = []
    # Search portfolios for posts that have an empty "img_hash", have a "value" not equal to zero,
    # and "duped_by" is an empty list.

    posts = list(portfolio_table.find({"$and": [
        {"img_hash": ""},
        {"deleted": False},
        {"value": {"$ne": 0}},
        {"duped_by": []}
    ]}))

    print(f'Hashing {len(posts)} post images.')
    for post in posts:
        if post["image_path"] and post["image_path"] != "None":
            if not exists(post["image_path"]):
                filename = post["image_path"].split('/')[-1]
                if exists('images/'+filename):
                    copy('images/'+filename, 'portfolio_images/'+filename)
                else:
                    continue
            img_hash = hashfile(post["image_path"])
            post["img_hash"] = img_hash
            portfolio_table.update_one({"_id": post['id']}, {"$set": post})
        else:
            pass 
        
    print(f'Comparing {len(posts)} post images.')
    for post in posts:
        if post["image_path"] == "":
            continue

        dupes = list(portfolio_table.find({"img_hash": post['img_hash']}))
        if len(dupes) > 1:
            if post not in dupes:
                continue
            for dupe in dupes:
                if post["id"] != dupe["id"]:
                    dupe["duped_by"].append(post["id"])
                    dupe["value"] = 0
                    portfolio_table.update_one({"_id": dupe['id']}, {"$set": dupe})
                    print(f'{dupe["url"]} marked as duped by {post["url"]}')


earliest_update = 999999999999
if __name__ == "__main__":
    identify_dupes()
    audit_cv_failures()
    audit_all()
    manual_audit()

    with open("earliest_update.txt", "w+") as f:
        f.write(str(earliest_update))
