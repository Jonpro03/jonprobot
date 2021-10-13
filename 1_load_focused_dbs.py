import shutil
import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage

def get_share_db_object(post):
    value = None
    for line in post["image_text"].splitlines():
        if '$' in line:
            try:
                line_value = "".join(c for c in line if c.isdigit() or c == ".")
                value = float(line_value)
            except:
                print(f"Failed to get value for {post['permalink']}")
    return {
        "id": post["id"],
        "image_text": post["image_text"],
        "image_path": post["img_path"],
        "value": value,
        "sub": post["subreddit"],
        "u": post["author"],
        "url": "https://reddit.com"+post["permalink"],
        "created": post["created"],
        "audited": False,
        "img_hash": ""
    }

def get_portfolio_db_object(post):
    value = None
    portfolio_seen = False
    done = False
    for line in post["image_text"].splitlines():
        if done:
            continue
        if 'Portfolio' in line or 'Holdings' in line:
            portfolio_seen = True
        if not portfolio_seen:
            continue
        if 'View Details' in line:
            done = True
        terms = line.split()
        for term in terms:
            if any(char.isdigit() for char in term):
                if any(char.isalpha() for char in term):
                    continue
                if any(c in term for c in ['/','$',':', '%']):
                    continue
                try:
                    value = float(term.replace(',',''))
                except:
                    print(f"Failed to get share count for {post['permalink']}")
                    continue
                break
        if value is not None:
            break
    
    if value is None:
        # Maybe they just did the investment summary screenshot
        if 'Investment Summary' in post['image_text']:
            for line in post['image_text'].splitlines():
                if '$' in line:
                    try:
                        line_value = "".join(c for c in line if c.isdigit() or c == ".")
                        value = float(line_value) / 170.0 # probably the average price...
                    except:
                        print(f"Failed to get share count for {post['permalink']}")
                    break
    return {
        "id": post["id"],
        "image_text": post["image_text"],
        "image_path": post["img_path"],
        "value": value,
        "sub": post["subreddit"],
        "u": post["author"],
        "url": "https://reddit.com"+post["permalink"],
        "created": post["created"],
        "audited": False,
        "img_hash": "",
    }


def update_shares_db():
    subs = [
        "GME",
        "Superstonk",
        "GMEJungle",
        "DDintoGME",
        "GME_Computershare"
    ]
    share_db = tinydb.TinyDB(f"new_shares_db.json")
    for sub in subs:
        db = tinydb.TinyDB(f"{sub}.json")
        q = tinydb.Query()
        posts = db.search(q.post_type=="shares")
        for post in posts:
            pid = post["id"]
            if len(share_db.search(q.id == pid)) > 0:
                continue
            record = get_share_db_object(post)
            if record is None:
                continue
            local_path = record["image_path"]
            dest_path = local_path.replace("images", "new_purchase_images")
            try:
                shutil.copy(local_path, dest_path)
            except:
                pass
            record["image_path"] = dest_path
            share_db.insert(record)
            print(f'{record["url"]} added to new shares db.')

def update_portfolio_db():
    subs = [
        "GME",
        "Superstonk",
        "GMEJungle",
        "DDintoGME",
        "GME_Computershare"
    ]
    added = 0
    portfolio_db = tinydb.TinyDB(f"portfolio_db.json")
    for sub in subs:
        db = tinydb.TinyDB(f"{sub}.json")
        q = tinydb.Query()
        posts = db.search(q.post_type=="portfolio")
        for post in posts:
            pid = post["id"]
            if len(portfolio_db.search(q.id == pid)) > 0:
                continue
            record = get_portfolio_db_object(post)
            if record is None:
                continue
            local_path = record["image_path"]
            dest_path = local_path.replace("images", "portfolio_images")
            try:
                shutil.copy(local_path, dest_path)
            except:
                pass
            record["image_path"] = dest_path
            portfolio_db.insert(record)
            print(f'{record["url"]} added to portfolio db.')
            added += 1
    print(f'Added {added} new portfolios.')

if __name__ == "__main__":
    print("Updating new shares database.")
    update_shares_db()
    print("Updating portfolio database.")
    update_portfolio_db()

#     old_pdb = tinydb.TinyDB(f"portfolio_db - Copy.json", storage=CachingMiddleware(JSONStorage))
#     new_pdb = tinydb.TinyDB(f"portfolio_db.json", storage=CachingMiddleware(JSONStorage))
#     old_sdb = tinydb.TinyDB(f"new_shares_db - Copy.json", storage=CachingMiddleware(JSONStorage))
#     new_sdb = tinydb.TinyDB(f"new_shares_db.json", storage=CachingMiddleware(JSONStorage))
#     q = tinydb.Query()

#     for opdb in old_pdb.all():
#         try:
#             if opdb["value"] is not None and opdb["value"] != 0 and opdb["audited"]:
#                 results = new_pdb.search((q.id == opdb["id"]) & (q.audited == False))
#                 if len(results) == 1:
#                     npdb = results[0]
#                     npdb["value"] = opdb["value"]
#                     npdb["audited"] = opdb["audited"]
#                     npdb["img_hash"] = opdb["img_hash"]
#                     new_pdb.update(npdb, doc_ids=[npdb.doc_id])
#                 else:
#                     print(f'{opdb["id"]} not found in new db.')
#         except:
#             print(f'{opdb["id"]} had a problem.')

#     for osdb in old_sdb.all():
#         try:
#             if osdb["value"] is not None and osdb["value"] != 0 and osdb["audited"]:
#                 results = new_sdb.search((q.id == osdb["id"]) & (q.audited == False))
#                 if len(results) == 1:
#                     nsdb = results[0]
#                     nsdb["value"] = osdb["value"]
#                     nsdb["audited"] = osdb["audited"]
#                     nsdb["img_hash"] = osdb["img_hash"]
#                     new_sdb.update(nsdb, doc_ids=[nsdb.doc_id])
#                 else:
#                     print(f'{osdb["id"]} not found in new db.')
#         except:
#             print(f'{osdb["id"]} had a problem.')

# old_pdb.close()
# old_sdb.close()
# new_pdb.close()
# new_sdb.close()