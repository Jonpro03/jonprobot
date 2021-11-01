import tinydb
from tinydb.queries import where
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
from os import system, remove
from os.path import exists
import time
import hashlib
from shutil import copy

def get_reddit_post(post_id, sdb):
    # Try portfolio/share db first

    q = tinydb.Query()
    posts = sdb.search(q.id == post_id)
    if len(posts) > 0:
        return posts[0]
    
    subs = [
        "GME",
        "Superstonk",
        "GMEJungle",
        "DDintoGME",
        "GME_Computershare",
        "infinitypool"
    ]
    
    for sub in subs:
        db = tinydb.TinyDB(f'{sub}.json')
        posts = db.search(q.id == post_id)
        if len(posts) > 0:
            post = posts[0]
            return {
                "id": post["id"],
                "image_text": post["image_text"],
                "image_path": post["img_path"],
                "img_hash": "",
                "value": None,
                "sub": post["subreddit"],
                "u": post["author"],
                "url": "https://reddit.com"+post["permalink"],
                "created": post["created"],
                "audited": False
            }
    return None

def print_post(post):
    print(f'ID: {post["id"]}')
    print(f'SubReddit: {post["sub"]}')
    print(f'Author: {post["u"]}')
    print(f'Value: {post["value"]}')

def get_new_value(post, sdb):
    while True:
        ans = input("How many shares? ")
        value = None
        try:
            value = float(ans)
        except:
            continue
        post["value"] = value
        post["audited"] = True
        q = tinydb.Query()
        sdb.upsert(post, q.id == post["id"])
        return

def audit_cv_failures():
    sdb = tinydb.TinyDB("portfolio_db.json")
    q = tinydb.Query()
    posts = sdb.search(q.value == None)
    posts.extend(sdb.search(q.value == ""))
    print(f"{len(posts)} posts to audit.")
    for post in posts:
        if '.' in post["image_path"]:
            if not exists(post["image_path"]):
                post["value"] = 0
                post["audited"] = True
                sdb.update(post, doc_ids=[post.doc_id])
                continue
            system(f"codium {post['image_path']}")
        ans = input("Is this a Computershare portfolio with visible value? Y/n ")
        if 'n' in ans.lower():
            post["value"] = 0
            post["audited"] = True
            sdb.update(post, doc_ids=[post.doc_id])
            try:
                remove(post['image_path'])
            except:
                pass
            continue
        get_new_value(post, sdb)
    while True:
        ans = input("Audit a record manually? Y/n ")
        if 'n' in ans.lower():
            break
        post_id = input("Post ID: ")
        post = get_reddit_post(post_id, sdb)
        if post is not None:
            post["audited"] = True
            sdb.upsert(post, q.id == post_id)
            if '.' in post["image_path"]:
                system(f"codium {post['image_path']}")
            print_post(post)
            ans = input("What should change? Value | Delete | Skip ")
            if 's' in ans.lower():
                continue
            if 'v' in ans.lower():
                get_new_value(post, sdb)
            if 'd' in ans.lower():
                post["value"] = 0
                sdb.update(post, doc_ids=[post.doc_id])
                try:
                    remove(post['image_path'])
                except:
                    pass
        else:
            ans = input("Post not found. Add? ")
            if 'n' in ans.lower():
                continue
            post = {
                "id": post_id,
                "image_text": "None",
                "image_path": "None",
                "sub": input("What subreddit? "),
                "u": input("Username? "),
                "url": input("URL? "),
                "created": time.time(),
                "audited": True,
                "img_hash": "None"
            }
            sdb.insert(post)
            get_new_value(post, sdb)


def audit_all():
    sdb = tinydb.TinyDB("portfolio_db.json")
    q = tinydb.Query()
    posts = sdb.search(~(q.value == 0) & (q.audited == False))
    print(f"{len(posts)} posts to audit.")
    for post in posts:
        post["audited"] = True
        sdb.update(post, doc_ids=[post.doc_id])
        system(f"codium {post['image_path']}")
        print(post["url"])
        ans = input(f"{post['value']} Audit this? Y/n ")
        if 'y' in ans.lower():
            get_new_value(post, sdb)


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
    sdb = tinydb.TinyDB("portfolio_db.json", storage=CachingMiddleware(JSONStorage))
    q = tinydb.Query()
    posts = sdb.search((q.img_hash == "") & ~(q.value == 0))
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
            sdb.update(post, doc_ids=[post.doc_id])
        else:
            pass #print(f'No image for {post["url"]}.')
    #posts = sdb.search(~(q.img_hash == "None") & ~(q.value == 0))
    print(f'Comparing {len(posts)} post images.')
    for post in posts:
        dupes = sdb.search((q.img_hash == post["img_hash"]) & ~(q.value == 0))
        if len(dupes) > 1:
            if dupes[0] not in identified:
                identified.extend(dupes)
                print("Dupe:")
                for dupe in dupes:
                    if dupe["value"] != 0:
                        print(dupe["sub"],dupe["id"])
    sdb.close()
    
if __name__ == "__main__":
    # sdb = tinydb.TinyDB("portfolio_db.json", storage=CachingMiddleware(JSONStorage))
    # q = tinydb.Query()
    # for post in sdb.all():
    #     post["created"] = int(post["created"])
    #     try:
    #         ih = post["img_hash"]
    #         if ih is null:
    #             post["img_hash"] = "None"
    #     except:
    #         post["img_hash"] = "None"
    #     sdb.update(post, doc_ids=[post.doc_id])
    # sdb.close()
    
    identify_dupes()
    audit_cv_failures()
    audit_all()
