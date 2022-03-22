import shutil
import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
import yfinance as yf
from datetime import datetime
from time import mktime

gme = yf.Ticker("GME")
close_val = gme.info["regularMarketPreviousClose"]

def get_time():
    with open("earliest_update.txt", "r") as f:
            start_time_str = f.read()
            return int(start_time_str)

def get_acct_num(post):
    d = int(mktime(datetime.date(datetime.fromtimestamp(post["created"])).timetuple()))
    for line in post["image_text"].splitlines():
        for word in line.split():
            if "C00" in word:
                word = ''.join([c for c in word if c.isdigit()])
                word = word.ljust(9, "0")
                if int(word) > 1000:
                    return (d, int(word))
    return (d, 0)

def get_share_db_object(post):
    value = None
    acct_date, acct_num = get_acct_num(post)
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
        "delta_value": 0,
        "sub": post["subreddit"],
        "u": post["author"],
        "url": "https://reddit.com"+post["permalink"],
        "created": int(post["created"]),
        "audited": False,
        "img_hash": "",
        "duped_by": [],
        "acct_date": acct_date,
        "acct_num": acct_num
    }

def get_portfolio_db_object(post):
    value = None
    portfolio_seen = False
    done = False
    acct_date, acct_num = get_acct_num(post)
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
                        value = float(line_value) / close_val
                    except:
                        print(f"Failed to get share count for {post['permalink']}")
                    break
    return {
        "id": post["id"],
        "image_text": post["image_text"],
        "image_path": post["img_path"],
        "value": value,
        "delta_value": 0,
        "sub": post["subreddit"],
        "u": post["author"],
        "url": "https://reddit.com"+post["permalink"],
        "created": int(post["created"]),
        "audited": False,
        "img_hash": "",
        "count_accounts": 1,
        "duped_by": [],
        "acct_date": acct_date,
        "acct_num": acct_num
    }

def update_shares_db():
    subs = [
        "GME",
        "Superstonk",
        "GMEJungle",
        "DDintoGME",
        "GME_Computershare",
        "infinitypool",
        "Spielstopp",
        "GMEOrphans"
    ]
    share_db = tinydb.TinyDB(f"new_shares_db.json")
    for sub in subs:
        db = tinydb.TinyDB(f"{sub}.json")
        q = tinydb.Query()
        posts = db.search((q.post_type=="shares") & (q.created > get_time()))
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
            record["gme_price"] = close_val
            share_db.insert(record)
            print(f'{record["url"]} added to new shares db.')

def update_portfolio_db():
    subs = [
        "GME",
        "Superstonk",
        "GMEJungle",
        "DDintoGME",
        "GME_Computershare",
        "infinitypool",
        "Spielstopp",
        "GMEOrphans"
    ]
    added = 0
    portfolio_db = tinydb.TinyDB(f"portfolio_db.json", storage=CachingMiddleware(JSONStorage))
    for sub in subs:
        db = tinydb.TinyDB(f"{sub}.json", storage=CachingMiddleware(JSONStorage))
        q = tinydb.Query()
        posts = db.search((q.post_type=="portfolio") & (q.created > get_time()))
        #posts = db.search((q.post_type=="portfolio"))
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
    portfolio_db.close()
    print(f'Added {added} new portfolios.')

if __name__ == "__main__":
    print("Updating new shares database.")
    update_shares_db()
    print("Updating portfolio database.")
    update_portfolio_db()
