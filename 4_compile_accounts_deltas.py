import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
from joblib import Parallel, delayed
from datetime import datetime


sdb = tinydb.TinyDB("new_shares_db.json", storage=CachingMiddleware(JSONStorage))
pdb = tinydb.TinyDB("portfolio_db.json", storage=CachingMiddleware(JSONStorage))
rdb = tinydb.TinyDB("results_db_new.json", storage=CachingMiddleware(JSONStorage))
q = tinydb.Query()

def get_time():
    with open("earliest_update.txt", "r") as f:
        start_time_str = f.read()
        return int(start_time_str)

def calc_deltas(ape):
    rdb.remove(q.u == ape)
    if len(rdb.search(q.u == ape)) > 0:
        print("It didn't work")

    count_accounts = 1
    first_post_purchase = False
    running_total_shares = 0
    
    ape_posts = sdb.search((q.u == ape) & (q.value > 0))
    ape_posts.extend(pdb.search((q.u == ape) & (q.value > 0)))
    #already_processed = [a["id"] for a in rdb.all()]

    if len(ape_posts) > 1:
        ape_posts = sorted(ape_posts, key=lambda i: i["created"])
        if "gme_price" in ape_posts[0]:
            first_post_purchase = True
    # if max([a['delta_value'] or 0 for a in ape_posts if 'delta_value' in a] or [0]) > 0:
    #     return
    values = []
    for post in ape_posts:
        count_accounts = 1
        try:
            count_accounts = max([post["count_accounts"] for post in ape_posts if "count_accounts" in post])
        except:
            pass
        if (post["duped_by"] != [] if "duped_by" in post else False):
            continue
        if "gme_price" not in post: # if portfolio
            if post['value'] in values:
                # Duplicate post
                post['delta_value'] = 0
            else:
                values.append(post["value"])
                if post["value"] < running_total_shares: # this ape posted a lower value portfolio after a higher value one. Multiple accounts
                    # Process this as an update to one of the existing accounts
                    # Look at all existing values up to this point and find the nearest w/o going over
                    nearest_delta = post["value"]
                    for val in values:
                        if val >= post["value"]:
                            continue
                        if post["value"] - val < nearest_delta:
                            nearest_delta = post["value"] - val
                    if nearest_delta == post["value"]:
                        count_accounts += 1
                    if count_accounts == 1:
                        count_accounts = 2
                    post["delta_value"] = nearest_delta

                    running_total_shares += post["delta_value"]
                else:
                    # if their first post was a purchase, and later a portfolio... guess that they have multiple accounts.
                    if count_accounts == 1 and first_post_purchase:
                        count_accounts = 2
                    post["delta_value"] = post["value"] - running_total_shares
                    running_total_shares += post["delta_value"]
        else: # if direct stock purchase
            value = post["value"] / (post["gme_price"] or 175.0)
            #splivy
            if post['created'] < 1658361600:
                value *= 4.0
            post["delta_value"] = value
            values.append(value)
            running_total_shares += value

        if "gme_price" not in post:
            post["count_accounts"] = count_accounts
            pdb.update(post, doc_ids=[post.doc_id])
        else:
            sdb.update(post, doc_ids=[post.doc_id])

        result_record = {
            "u": post["u"],
            "id": post["id"],
            "time": int(post["created"]),
            "delta_value": post["delta_value"],
            "accounts": count_accounts,
            "displayed_value": post["value"],
            "url": post["url"],
            "image": post["image_path"].replace("portfolio_images", "drs_images")
        }
        rdb.insert(result_record)
    if count_accounts > 1:
        print(ape, running_total_shares, count_accounts)

#Get a list of all ape names
since = get_time()
apes = [p['u'] for p in pdb.search((q.value > 0) & (q.created > since))]
apes.extend([s['u'] for s in sdb.search((q.value > 0) & (q.created > since))])
apes = sorted(list(set(apes))) # distinct

for ape in apes:
    try:
        calc_deltas(ape)
    except:
        print(f"{ape} failed.")

rdb.close()
