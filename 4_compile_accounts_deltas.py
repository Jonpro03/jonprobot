import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
from joblib import Parallel, delayed
from datetime import datetime


sdb = tinydb.TinyDB("new_shares_db.json", storage=CachingMiddleware(JSONStorage))
pdb = tinydb.TinyDB("portfolio_db.json", storage=CachingMiddleware(JSONStorage))
rdb = tinydb.TinyDB("results_db_new.json", storage=CachingMiddleware(JSONStorage))
q = tinydb.Query()

def calc_deltas(ape):
    if ape == '': return

    count_accounts = 1
    first_post_purchase = False
    running_total_shares = 0
    
    ape_posts = sdb.search((q.u == ape) & (q.value > 0))
    ape_posts.extend(pdb.search((q.u == ape) & (q.value > 0)))

    if len(ape_posts) > 1:
        ape_posts = sorted(ape_posts, key=lambda i: i["created"])
        if "gme_price" in ape_posts[0]:
            first_post_purchase = True
    # if max([a['delta_value'] or 0 for a in ape_posts if 'delta_value' in a] or [0]) > 0:
    #     return
    values = []
    for post in ape_posts:
        if (post["duped_by"] != [] if "duped_by" in post else False):
            continue
        if "gme_price" not in post: # if portfolio
            values.append(post["value"])
            # if their first post was a purchase, and later a portfolio... guess that they have multiple accounts.
            if count_accounts == 1 and first_post_purchase:
                count_accounts = 2
            if post["value"] < max(values): # this ape posted a lower value portfolio after a higher value one. Multiple accounts
                #ans = input(f"{ape}'s ape portfolio post {post['id']} is lower than the previous. Actual [D]ecrease or [M]ultiple accounts? ")
                # if 'd' in ans.lower():
                #     running_total_shares = value
                # else:
                count_accounts += 1
                post["delta_value"] = post["value"]
                running_total_shares += post["value"]
            else:
                post["delta_value"] = post["value"] - running_total_shares
                running_total_shares += post["delta_value"]
        else: # if direct stock purchase
            value = post["value"] / (post["gme_price"] or 175.0)
            post["delta_value"] = value
            values.append(value)
            running_total_shares += value

        if "gme_price" not in post:
            post["count_accounts"] = count_accounts
            pdb.update(post, doc_ids=[post.doc_id])
        else:
            sdb.update(post, doc_ids=[post.doc_id])

        if post["delta_value"] > 0:
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
apes = [p['u'] for p in pdb.search(q.value > 0)]
apes.extend([s['u'] for s in sdb.search(q.value > 0)])
apes = sorted(list(set(apes))) # distinct

for ape in apes:
    try:
        calc_deltas(ape)
    except:
        print(f"{ape} failed.")

rdb.close()