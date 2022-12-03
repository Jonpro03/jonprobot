import multiprocessing
from joblib import Parallel, delayed
from datetime import datetime
from pymongo import MongoClient
from dotenv import dotenv_values


config = dotenv_values(".env")
mongo = MongoClient(config["DB_CONNECT_STR"])
computershare_posts = mongo["computershare_posts"]
sdb = computershare_posts['purchases']
pdb = computershare_posts['portfolios']
rdb = mongo['computershared']['portfolios']


def get_time():
    with open("earliest_update.txt", "r") as f:
        start_time_str = f.read()
        return int(start_time_str)

def process_apes(apes):
    for ape in apes:
        calc_deltas(ape)

def calc_deltas(ape):
    rdb.delete_many({"u": ape})

    count_accounts = 1
    first_post_purchase = False
    running_total_shares = 0

    ape_posts = list(sdb.find({"$and": [
        {"u": ape},
        {"deleted": False}
    ]}))

    ape_posts.extend(list(pdb.find({"$and": [
        {"u": ape},
        {"deleted": False}
    ]})))

    ape_posts = sorted(ape_posts, key=lambda i: i["created"])
    ape_posts[0]["count_accounts"] = 1
    if len(ape_posts) > 1:
        if ape_posts[0]['post_type'] == "purchase":
            first_post_purchase = True
    # if max([a['delta_value'] or 0 for a in ape_posts if 'delta_value' in a] or [0]) > 0:
    #     return
    values = []
    count_accounts = 1
    for post in ape_posts:
        # try:
        #     count_accounts = max([post["count_accounts"], count_accounts])
        # except:
        #     pass
        if (post["duped_by"] != [] if "duped_by" in post else False):
            continue
        if post['post_type'] == "portfolio":
            if post['value'] in values:
                # Duplicate post
                post['delta_value'] = 0
            else:
                values.append(post["value"])
                # this ape posted a lower value portfolio after a higher value one. Multiple accounts
                if post["value"] < running_total_shares:
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
        else:  # if cs purchase
            value = post["value"] / (post["gme_price"] or 175.0)
            # splivy
            if post['created'] < 1658361600:
                value *= 4.0
            post["delta_value"] = value
            values.append(value)
            running_total_shares += value

        if "gme_price" not in post:
            post["count_accounts"] = count_accounts
            pdb.update_one({"_id": post['id']}, {"$set": post})
        else:
            sdb.update_one({"_id": post['id']}, {"$set": post})

        result_record = {
            "u": post["u"],
            "id": post["id"],
            "_id": post["id"],
            "time": int(post["created"]),
            "delta_value": post["delta_value"],
            "accounts": count_accounts,
            "displayed_value": post["value"],
            "url": post["url"],
            "image": post["image_path"].replace("portfolio_images", "drs_images")
        }
        rdb.insert_one(result_record)
    if count_accounts > 1:
        print(ape, running_total_shares, count_accounts)


# Get a list of all ape names
since = get_time()
#since = 1631678712

apes = list(sdb.find({"$and": [
    {"created": {"$gte": since}},
    {"deleted": False}
]}, {'u': 1}))

apes.extend(list(pdb.find({"$and": [
    {"created": {"$gte": since}},
    {"deleted": False}
]}, {'u': 1})))
apes = sorted(list(set([a['u'] for a in apes])))

if __name__ == "__main__":
    # Parallelize the work across all CPUs
    n = 14
    job_sets = [apes[i * n:(i + 1) * n] for i in range((len(apes) + n - 1) // n )]

    pool = multiprocessing.Pool(processes=n)
    results = [pool.apply_async(process_apes, args=(a,)) for a in job_sets]
    returns = []
    for p in results:
        try:
            returns.append(p.get())
        except Exception as e:
            print(e)