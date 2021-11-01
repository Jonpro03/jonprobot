import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
from shutil import copy
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from datetime import datetime
from time import mktime
import yfinance as yf

gme = yf.Ticker("GME")
close_val = gme.info["regularMarketPreviousClose"]

sdb = tinydb.TinyDB("new_shares_db.json", storage=CachingMiddleware(JSONStorage))
pdb = tinydb.TinyDB("portfolio_db.json", storage=CachingMiddleware(JSONStorage))
rdb = tinydb.TinyDB("results_db.json", storage=CachingMiddleware(JSONStorage))

for post in sdb.all():
    try:
        post["created"]
    except:
        post["created"] = 0
        sdb.update(post, doc_ids=[post.doc_id])
for post in pdb.all():
    try:
        post["created"]
    except:
        post["created"] = 0
        pdb.update(post, doc_ids=[post.doc_id])

# for new shares, if they appear more than once
# combine the totals
q = tinydb.Query()
for share_post in sdb.search(q.value > 0):
    # check we haven't already done this user
    posts_results = rdb.search((q.u == share_post["u"]) & (q.type == "purchase"))
    if len(posts_results) > 0:
        continue

    posts_user = sdb.search((q.value > 0) & (q.u == share_post["u"]))
    if len(posts_user) > 1:
        print(f"{posts_user[0]['u']} has multiple purchase records.")
        # they made multiple posts of share purchases
        result_record = {
            "u": posts_user[0]['u'],
            "type": "purchase",
            "value": sum([x["value"]/x["gme_price"] for x in posts_user]),
            "time": max([int(x["created"]) for x in posts_user]),
            "urls": [x["url"] for x in posts_user],
            "images": [x["image_path"].replace("new_purchase_images", "drs_images") for x in posts_user]
        }
        for pu in posts_user:
            try:
                copy(pu["image_path"], pu["image_path"].replace("new_purchase_images", "drs_images"))
            except:
                pass
    else:
        # they made a single purchase post
        pu = posts_user[0]
        val = 0
        try:
            val = pu["value"] / pu["gme_price"]
        except:
            val = pu["value"] / 175.0
        result_record = {
            "u": pu['u'],
            "type": "purchase",
            "value": val,
            "time": int(pu["created"]),
            "urls": [pu["url"]],
            "images": [pu["image_path"].replace("new_purchase_images", "drs_images")]
        }
        try:
            copy(pu["image_path"], pu["image_path"].replace("new_purchase_images", "drs_images"))
        except:
            pass
    
    if result_record["value"] == 0:
        print("About to insert 0 value record.")
    rdb.insert(result_record)

# for portfolios, if they appear more than once
# drop the lower value
for pf_post in pdb.search(q.value > 0):
    # check we haven't already done this user
    posts_results = rdb.search((q.u == pf_post["u"]) & (q.type == "portfolio"))
    if len(posts_results) > 0:
        continue

    posts_user = pdb.search((q.value > 0) & (q.u == pf_post["u"]))
    pu = posts_user[0]
    if len(posts_user) > 1:
        print(f"{pu['u']} has multiple portfolio records.")
        # they made multiple posts of portfolios
        # only keep the highest value one
        for p in posts_user:
            if p["value"] > pu["value"]:
                pu = p
    result_record = {
        "u": pu['u'],
        "type": "portfolio",
        "value": pu["value"],
        "time": int(pu["created"]),
        "urls": [pu["url"]],
        "images": [pu["image_path"].replace("portfolio_images", "drs_images")]
    }
    try:
        copy(pu["image_path"], pu["image_path"].replace("portfolio_images", "drs_images"))
    except:
        pass
    if result_record["value"] == 0:
        print("About to insert 0 value record.")
    rdb.insert(result_record)

# if a user has both a purchase and a portfolio post, and the portfolio post is AFTER the purchase
# post, then drop the purchase
for results_post in rdb.all():
    user = results_post['u']
    users_results = rdb.search(q.u == user)
    if len(users_results) > 1:
        users_purchases = rdb.search((q.u == user) & (q.type == "purchase"))
        users_portfolios = rdb.search((q.u == user) & (q.type == "portfolio"))
        if len(users_purchases) > 0 and len(users_portfolios) > 0:
            portfolio_timestamp = max([x["time"] for x in rdb.search((q.u == user) & (q.type == "portfolio"))])
            for purchase in users_purchases:
                purchase_timestamp = purchase["time"]
                if portfolio_timestamp > purchase_timestamp:
                    # print(f"Removing {user}'s purchase post b/c it's captured in their portfolio.")
                    # rdb.remove(doc_ids=[purchase.doc_id])
                    print(f"Zeroing {user}'s purchase post b/c it's captured in their portfolio.")
                    purchase["value"] = 0
                    rdb.update(purchase, doc_ids=[purchase.doc_id])
                else:
                    # Purchase happened after a portfolio was posted.
                    # Add the value of the purchase to their portfolio
                    # Don't know what the cost basis will be, so use today's closing price
                    print(f"Adding {user}'s purchase post to their portfolio.")
                    num_shares = purchase["value"]
                    portfolio = rdb.search((q.u == user) & (q.type == "portfolio") & (q.time == portfolio_timestamp))[0]
                    portfolio["value"] += num_shares
                    portfolio["urls"].extend(purchase["urls"])
                    rdb.update(portfolio, doc_ids=[portfolio.doc_id])
                    rdb.remove(doc_ids=[purchase.doc_id])

rdb.close()
