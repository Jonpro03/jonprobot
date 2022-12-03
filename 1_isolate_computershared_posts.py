import shutil
import yfinance as yf
from datetime import datetime
from time import mktime
from pymongo import MongoClient
from dotenv import dotenv_values

gme = yf.Ticker("GME")
close_val = gme.info["regularMarketPreviousClose"]

config = dotenv_values(".env")
mongo = MongoClient(config["DB_CONNECT_STR"])
reddit_posts = mongo["reddit_posts"]
computershare_posts = mongo["computershare_posts"]

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

def get_purchase_record(post):
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
        "_id": post["id"],
        "image_text": post["image_text"],
        "image_path": post["img_path"],
        "img_hash": "",
        "value": value,
        "delta_value": 0,
        "gme_price": close_val,
        "sub": post["subreddit"],
        "u": post["author"],
        "url": "https://reddit.com"+post["permalink"],
        "created": int(post["created"]),
        "audited": False,
        "duped_by": [],
        "acct_date": acct_date,
        "acct_num": acct_num,
        "deleted": False,
        "post_type": post['post_type']
    }

def get_portfolio_record(post):
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
        "_id": post["id"],
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
        "acct_num": acct_num,
        "deleted": False,
        "post_type": post['post_type']
    }

def load_purchases():
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
    purchase_table = computershare_posts['purchases']
    
    for sub in subs:
        reddit_sub_table = reddit_posts[sub]
        # Find all posts classified as "purchase"
        # since last update
        posts = list(reddit_sub_table.find({"$and": [
            {"post_type": "purchase"},
            {"created": {"$gte": get_time()}}
        ]}))

        for post in posts:
            pid = post["id"]
            # sanity check already processed
            if (purchase_table.find_one({"_id": pid})) is not None:
                continue
            record = get_purchase_record(post)
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
            purchase_table.insert_one(record)
            print(f'{record["url"]} added to new shares db.')

def load_portfolios():
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
    added = 0
    portfolio_table = computershare_posts['portfolios']
    
    for sub in subs:
        reddit_sub_table = reddit_posts[sub]

        # Find all posts classified as "portfolio"
        # since last update
        posts = list(reddit_sub_table.find({"$and": [
            {"post_type": "portfolio"},
            {"created": {"$gte": get_time()}}
        ]}))
        for post in posts:
            pid = post["id"]
            # sanity check already processed
            if (portfolio_table.find_one({"_id": pid})) is not None:
                continue
            record = get_portfolio_record(post)
            if record is None:
                continue
            local_path = record["image_path"]
            dest_path = local_path.replace("images", "portfolio_images")
            try:
                shutil.copy(local_path, dest_path)
            except:
                pass
            record["image_path"] = dest_path
            portfolio_table.insert_one(record)
            print(f'{record["url"]} added to portfolio db.')
            added += 1

    print(f'Added {added} new portfolios.')

if __name__ == "__main__":
    print("Updating new shares database.")
    load_purchases()
    print("Updating portfolio database.")
    load_portfolios()
