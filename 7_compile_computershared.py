import boto3
import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
from datetime import datetime, date, timedelta, timezone
import pytz
from time import mktime
import calendar as cal
import numpy as np
import statistics
import json

aws_region = "us-west-2"
aws_access_key = ""
aws_secret_access_key = ""
BUCKET = "computershared-assets"

session = boto3.Session(aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret_access_key)
s3_client = session.client('s3')

#today = datetime.today().replace(hour=19, minute=0, second=0)
today = (datetime.utcnow() - timedelta(days=1)).replace(hour=23, minute=59, second=59, tzinfo=pytz.utc)
epoch = datetime(1970, 1, 1)


def get_accounts(start, delta, delta_unit="days"):
    existing_apes = {}
    daily_accounts = {}
    cumulative_accounts = {}
    cumulative_results = 0

    range_unit = delta.days if delta_unit == "days" else 24
    range_unit += 1
    s = cal.timegm(start.utctimetuple())
    delta = timedelta(days=1) if delta_unit == "days" else timedelta(hours=1)

    for i in range(1, range_unit):
        end = start + delta
        s = cal.timegm(start.utctimetuple())
        e = cal.timegm(end.utctimetuple())
        r = rdb.search((q.time > s) & (q.time <= e))

        today_apes = {p['u']: p['accounts'] for p in r}
        count_results = 0
        for a, v in today_apes.items():
            if a in existing_apes:
                if existing_apes[a] < v:
                    count_results += v - existing_apes[a]
                    existing_apes.update({a: v})
            else:
                count_results += v
                existing_apes.update({a: v})

        daily_accounts[e] = round(count_results)
        cumulative_results += count_results
        cumulative_accounts[e] = round(cumulative_results)

        start = end
        print(f"Accounts {int((i/range_unit) * 100)}%\r")
    
    return  {
        "daily": list(daily_accounts.values()),
        "cumulative": list(cumulative_accounts.values()),
        "count_apes": len(set(existing_apes.keys())),
        "count_accounts": sum(existing_apes.values())
    }


def get_posts(start, delta, delta_unit="days"):
    aggregate_posts = {}
    daily_posts = {}
    aggregate_results = 0

    range_unit = delta.days if delta_unit == "days" else 24
    range_unit += 1
    s = cal.timegm(start.utctimetuple())
    delta = timedelta(days=1) if delta_unit == "days" else timedelta(hours=1)

    for i in range(1, range_unit):
        end = start + delta
        s = cal.timegm(start.utctimetuple())
        e = cal.timegm(end.utctimetuple())
        r = rdb.search((q.time > s) & (q.time <= e))

        daily_posts[e] = len(r)
        aggregate_results += len(r)
        aggregate_posts[e] = aggregate_results
        start = end
        print(f"Posts {int((i/range_unit) * 100)}%\r")

        
    return {
        "daily": list(daily_posts.values()),
        "cumulative": list(aggregate_posts.values())
    }


def get_shares(start, delta, delta_unit="days"):
    aggregate_shares = {}
    daily_shares_total = {}
    daily_shares_new = {}
    daily_shares_growth = {}
    aggregate_results = 0

    range_unit = delta.days if delta_unit == "days" else 24
    range_unit += 1
    s = cal.timegm(start.utctimetuple())
    delta = timedelta(days=1) if delta_unit == "days" else timedelta(hours=1)

    for i in range(1, range_unit):
        end = start + delta
        s = cal.timegm(start.utctimetuple())
        e = cal.timegm(end.utctimetuple())
        r = rdb.search((q.time > s) & (q.time <= e))

        accts = [x["delta_value"] for x in r if x["delta_value"] > 0]
        shares_from_growth = 0
        for post in r:
            shares_from_growth += post['delta_value'] if post['displayed_value'] > post['delta_value'] else 0

        sum_results = sum(accts)
        shares_wo_growth = sum_results - shares_from_growth

        daily_shares_total[e] = round(sum_results, 2)
        daily_shares_growth[e] = round(shares_from_growth, 2)
        daily_shares_new[e] = round(shares_wo_growth, 2)
        aggregate_results += sum_results
        aggregate_shares[e] = round(aggregate_results, 2)

        start = end
        print(f"Shares {int((i/range_unit) * 100)}%\r")
    return {
            "daily": {
                "total": list(daily_shares_total.values()),
                "from_new": list(daily_shares_new.values()),
                "from_growth": list(daily_shares_growth.values())
            },
            "cumulative": list(aggregate_shares.values())
    }


def get_labels(start, delta, delta_unit="days"):
    labels = {}
    range_unit = delta.days if delta_unit == "days" else 24
    range_unit += 1
    for i in range(1, range_unit):
        end = start + (timedelta(days=i) if delta_unit == "days" else timedelta(hours=i))
        e = cal.timegm(end.utctimetuple())
        if delta_unit == "days":
            labels[e] = end.isoformat()
        else:
            labels[e] = str(end.hour)
    return list(labels.values())


def get_highscores(start, delta, delta_unit="days"):
    range_unit = delta.days if delta_unit == "days" else 24
    range_unit += 1
    aggregate_highscores = {}
    daily_highscores = {}

    date_pattern = "%Y-%m-%d"
    with open('highscores.csv', 'r') as f:
        lines = f.readlines()
        for line in lines:
            date_str, *val_str = line.rstrip().split(',')
            date_num = int((datetime.strptime(date_str, date_pattern) - epoch).total_seconds())
            val = int(val_str[0])
            if date_num in aggregate_highscores:
                if val > aggregate_highscores[date_num]:
                    aggregate_highscores[date_num] = val
            else:
                aggregate_highscores[date_num] = val
    
    avail_dates = aggregate_highscores.keys()
    highscore = 0
    for i in range(1, range_unit):
        end = start + (timedelta(days=i) if delta_unit == "days" else timedelta(hours=i))
        e = cal.timegm(end.utctimetuple())
        closest_date = 99999999999
        for av_date in avail_dates:
            delta = e - av_date
            if delta < 0: continue
            if delta < abs(e - closest_date):
                closest_date = av_date
        if aggregate_highscores[closest_date] > highscore:
            highscore = aggregate_highscores[closest_date]
        daily_highscores[e] = highscore * 100
    return daily_highscores, highscore * 100


def get_highscore_scatter():
    date_pattern = "%Y-%m-%d"
    data = []
    daily_high_dict = {}
    daily_high = []
    daily_high_labels = []
    with open('highscores.csv', 'r') as f:
        lines = f.readlines()
        for line in lines:
            date_str, *val_str = line.rstrip().split(',')
            date_num = int((datetime.strptime(date_str, date_pattern) - epoch + timedelta(days=1)).total_seconds())
            if date_num not in daily_high_dict:
                daily_high_dict[date_num] = 0
            val = int(val_str[0])
            data.append({'x': date_num*1000, 'y': val*100})
            daily_high_dict[date_num] = max(daily_high_dict[date_num], val)
    return data


def get_ownership(last_update, hs):
    return {
        "last_update": last_update,
        "computershare_accounts": hs / 100,
        "total_outstanding": 75950781,
        "insider": 12612303,
        "institutional": 28364083,
        "etfs": 6690476,
        "mfs": 7957066,
        "inst_fuckery": 13716541
    }


def get_statistics(results):
    results = results if len(results) > 1 else [0,0]
    total_accts = len(results)
    data_set = sorted(results)
    trim_size = max(int(total_accts * 0.05), 1)
    trmd_results = sorted(results)[trim_size:-trim_size]
    trmd_results = [0,0] if len(trmd_results) < 2 else trmd_results
    return {
        "sampled_accounts": total_accts,
        "sampled_shares": float(round(sum(data_set), 2)),
        "std_dev": float(round(statistics.stdev(data_set), 2)),
        "median": float(round(statistics.median(data_set), 2)),
        "mode": float(round(statistics.mode([round(x, 2) for x in data_set]), 2)),
        "average": float(round(statistics.mean(data_set), 2)),
        "trimmed_average": float(round(statistics.mean(trmd_results), 2)),
        "trm_std_dev": float(round(statistics.stdev(trmd_results), 2))
    }


def get_stats_history(start, end):
    sampled_accounts = []
    sampled_shares = []
    averages = []
    medians = []
    modes = []
    trimmed_means = []
    std_devs = []
    trm_std_devs = []

    for i in range(1, (end - start).days + 1):
        d = start + timedelta(days=i)
        dataset = [float(a[1]) for a in get_account_balances(d)]
        stats = get_statistics(dataset)

        sampled_accounts.append(stats["sampled_accounts"])
        sampled_shares.append(stats["sampled_shares"])
        averages.append(stats["average"])
        medians.append(stats["median"])
        modes.append(stats["mode"])
        trimmed_means.append(stats["trimmed_average"])
        std_devs.append(stats["std_dev"])
        trm_std_devs.append(stats["trm_std_dev"])

        print(f"Statistics {i}\r")
    
    return  {
        "sampled_accounts": sampled_accounts,
        "sampled_shares": sampled_shares,
        "std_devs": std_devs,
        "medians": medians,
        "modes": modes,
        "averages": averages,
        "trimmed_means": trimmed_means,
        "trm_std_devs": trm_std_devs
    }


def get_account_balances(end):
    account_totals = []
    try:
        with open(f"aws_upload/account_balances/{end.strftime('%Y-%m-%d')}.csv", 'r') as f:
            lines = f.readlines()
            for line in lines:
                items = line.split(',')
                account_totals.append((items[0], items[1]))
    except:
        print(f"ERROR: Failed to get acct balance for {end}")
        return []
    return account_totals


def get_histogram(accounts):
    data = np.array(accounts)
    hist, bins = np.histogram(data, bins=np.geomspace(1, 32768, num=16))
    hist = np.append(hist, [0])
    hist = [str(round(x)) for x in hist]
    bins = [str(round(x)) for x in bins]
    return {
        "labels": bins,
        "values": hist
    }

def get_estimates(stats, highs):
    averages = []
    medians = []
    modes = []
    trimmed_means = []

    for i in range(0, len(highs)):
        averages.append(round(highs[i] * stats["averages"][i]))
        medians.append(round(highs[i] * stats["medians"][i]))
        trimmed_means.append(round(highs[i] * stats["trimmed_means"][i]))
        modes.append(round(highs[i] * stats["modes"][i]))
    
    return  {
        "averages": averages,
        "medians": medians,
        "modes": modes,
        "trimmed_means": trimmed_means,
    }


start = datetime(2021, 9, 12, 23, 59, tzinfo=pytz.utc)
#start = datetime(2021, 12, 5, 23, 59, tzinfo=pytz.utc)
rdb = tinydb.TinyDB("results_db_new.json")
q = tinydb.Query()

delta = today - start

# Get All Time
daily_hs, hs = get_highscores(start, delta)
hs_scatter = get_highscore_scatter()
hs_payload = {
    "scatter": hs_scatter,
    "high_labels": [hs * 1000 for hs in daily_hs.keys()],
    "high": list(daily_hs.values())
}
with open("aws_upload/highscores.json", "w+") as f:
    json.dump(hs_payload, f)
s3_client.upload_file("aws_upload/highscores.json", BUCKET, "highscores.json")

last_update = max([x["time"] for x in rdb.all()])
last_update = datetime.fromtimestamp(last_update).isoformat()
with open("aws_upload/ownership.json", "w+") as f:
    json.dump(get_ownership(last_update, hs*100), f)
s3_client.upload_file("aws_upload/ownership.json", BUCKET, "ownership.json")

shrs_in_accounts = sorted([float(a[1].rstrip()) for a in get_account_balances(today)])

stats_history = get_stats_history(start, today)
num_cs_accts = hs_payload["high"]
estimates = get_estimates(stats_history, num_cs_accts)

chart_data = {
    "labels": get_labels(start, delta),
    "stats": stats_history,
    "posts": get_posts(start, delta),
    "accounts": get_accounts(start, delta),
    "shares": get_shares(start, delta),
    "distribution": get_histogram(shrs_in_accounts),
    "estimates": estimates
}

with open("aws_upload/all_charts.json", "w+") as f:
    json.dump(chart_data, f)
s3_client.upload_file("aws_upload/all_charts.json", BUCKET, "all_charts.json")


todays_stats = {
    "sampled_accounts": stats_history["sampled_accounts"][-1],
    "sampled_shares": stats_history["sampled_shares"][-1],
    "std_dev": stats_history["std_devs"][-1],
    "median": stats_history["medians"][-1],
    "mode": stats_history["modes"][-1],
    "average": stats_history["averages"][-1],
    "trimmed_average": stats_history["trimmed_means"][-1],
    "trm_std_dev": stats_history["trm_std_devs"][-1],
}

with open("aws_upload/all_stats.json", "w+") as f:
    json.dump(todays_stats, f)
s3_client.upload_file("aws_upload/all_stats.json", BUCKET, "all_stats.json")

audit_start = int(float(hs_payload["high_labels"][-2])/1000.0)
ars = rdb.search(q.time > audit_start)
highest = ""
hs = 0
for ar in ars:
    if ar["delta_value"] > hs:
        hs = ar["delta_value"]
        highest = ar["id"]
print(highest, hs)


with open("shares.csv", "w+", encoding="utf-8") as f:
    f.write("time,u/,accounts,displayed_shares,delta_shares,url,image\n")
    for record in rdb.all():
        f.write(f'{np.datetime64(datetime.utcfromtimestamp(record["time"]))},{record["u"]},{record["accounts"]},{str(record["displayed_value"])},{str(record["delta_value"])},"{str(record["url"])}","https://s3-us-west-2.amazonaws.com/computershared-reddit-images/{str(record["image"]).replace("drs_images/", "")}"\n')
