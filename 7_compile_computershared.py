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

aws_region = ""
aws_access_key = ""
aws_secret_access_key = ""
BUCKET = ""

session = boto3.Session(aws_access_key_id=aws_access_key,
                        aws_secret_access_key=aws_secret_access_key)
s3_client = session.client('s3')

#today = datetime.today().replace(hour=19, minute=0, second=0)
today = (datetime.utcnow() - timedelta(days=1)).replace(hour=23,
                                                        minute=59, second=59, tzinfo=pytz.utc)
epoch = datetime(1970, 1, 1)


def get_account_growth(start, delta):
    weekly_total_account_growth_pct = {}
    aggregate_shares = shares_from_growth = 0

    range_unit = int(delta.days / 7.0)
    range_unit += 1
    delta = timedelta(days=7)

    for i in range(1, range_unit):
        end = start + delta

        s = cal.timegm(start.utctimetuple())
        e = cal.timegm(end.utctimetuple())
        r = rdb.search((q.time > s) & (q.time <= e))

        accts_grew = [x["delta_value"] for x in r if x["delta_value"]
                      > 0 and x["delta_value"] != x["displayed_value"]]
        all_accts = [x["delta_value"] for x in r if x["delta_value"] > 0]

        # Only for 2022
        if start.year > 2021:
            weekly_total_account_growth_pct[start.isoformat()] = sum(
                accts_grew) / aggregate_shares

        aggregate_shares += sum(all_accts)
        start = end
    return {
        "weekly_total_account_growth_pct": weekly_total_account_growth_pct
    }


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
        print(f"Accounts {int((i/range_unit) * 100)}%    ", end='\r')

    return {
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
        print(f"Posts {int((i/range_unit) * 100)}%      ", end='\r')

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
            v = post['delta_value'] if post['displayed_value'] > post['delta_value'] else 0
            if v < 0:
                print(f"huh... {v}")
            shares_from_growth += max(v, 0)

        sum_results = sum(accts)
        shares_wo_growth = sum_results - shares_from_growth

        daily_shares_total[e] = max(round(sum_results, 2), 0)
        daily_shares_growth[e] = max(round(shares_from_growth, 2), 0)
        daily_shares_new[e] = max(round(shares_wo_growth, 2), 0)
        aggregate_results += sum_results
        aggregate_shares[e] = round(aggregate_results, 2)

        start = end
        print(f"Shares {int((i/range_unit) * 100)}%   ", end='\r')
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
        end = start + (timedelta(days=i) if delta_unit ==
                       "days" else timedelta(hours=i))
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
            date_num = int(
                (datetime.strptime(date_str, date_pattern) - epoch).total_seconds())
            val = int(val_str[0])
            if date_num in aggregate_highscores:
                if val > aggregate_highscores[date_num]:
                    aggregate_highscores[date_num] = val
            else:
                aggregate_highscores[date_num] = val

    avail_dates = aggregate_highscores.keys()
    highscore = 0
    for i in range(1, range_unit):
        end = start + (timedelta(days=i) if delta_unit ==
                       "days" else timedelta(hours=i))
        e = cal.timegm(end.utctimetuple())
        closest_date = 99999999999
        for av_date in avail_dates:
            delta = e - av_date
            if delta < 0:
                continue
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

    pdb = tinydb.TinyDB("portfolio_db.json")
    q = tinydb.Query()
    for result in pdb.search((q.acct_num > 1000) & (q.acct_num < 200000)):
        d = int(result["acct_date"])
        n = int(result["acct_num"])
        data.append({'x': d * 1000, 'y': n})

    with open('highscores.csv', 'r') as f:
        lines = f.readlines()
        for line in lines:
            date_str, *val_str = line.rstrip().split(',')
            date_num = int((datetime.strptime(
                date_str, date_pattern) - epoch + timedelta(days=1)).total_seconds())
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
        "total_outstanding": 304516136,
        "insider": 53987600,
        "stagnant": 15472272,
        "institutional": 115381888,
        "etfs": 26480620,
        "mfs": 33262400,
        "inst_fuckery": 36824662
    }


def get_statistics(results):
    results = results if len(results) > 1 else [0, 0]
    # Only use the last 60 days
    total_accts = len(results)
    data_set = sorted(results)
    upper_trim = max(int(total_accts * 0.05), 1)
    lower_trim = max(int(total_accts * 0.05), 1)
    trmd_results = sorted(results)[lower_trim:-upper_trim]
    trmd_results = [0, 0] if len(trmd_results) < 2 else trmd_results
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
        dataset = [float(a[1]) for a in load_account_balances(d)]
        stats = get_statistics(dataset)

        sampled_accounts.append(stats["sampled_accounts"])
        sampled_shares.append(stats["sampled_shares"])
        averages.append(stats["average"])
        medians.append(stats["median"])
        modes.append(stats["mode"])
        trimmed_means.append(stats["trimmed_average"])
        std_devs.append(stats["std_dev"])
        trm_std_devs.append(stats["trm_std_dev"])

        print(f"Statistics {i}   ", end='\r')

    return {
        "sampled_accounts": sampled_accounts,
        "sampled_shares": sampled_shares,
        "std_devs": std_devs,
        "medians": medians,
        "modes": modes,
        "averages": averages,
        "trimmed_means": trimmed_means,
        "trm_std_devs": trm_std_devs
    }


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

    return {
        "averages": averages,
        "medians": medians,
        "modes": modes,
        "trimmed_means": trimmed_means,
    }


def get_week_purchase_power():
    powers = {}
    start = datetime(2022, 1, 2)
    today = datetime.today()
    delta = (today - start).days // 7

    for i in range(1, delta):
        end = start + timedelta(weeks=i)
        results = load_puchase_power(end)
        trim = max(int(len(results) * 0.05), 1)
        trmd_results = sorted(results)[trim:-trim]
        powers[end.isoformat()] = statistics.median(trmd_results)
    return powers


def load_account_balances(end):
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


def load_puchase_power(end):
    total = []
    try:
        with open(f"aws_upload/account_balances/{end.strftime('%Y-%m-%d')}.csv", 'r') as f:
            lines = f.readlines()
            for line in lines:
                items = line.rstrip().split(',')
                total.append(float(items[3]))
    except:
        print(f"ERROR: Failed to get pur power for {end}")
        return []
    return total

start = datetime(2021, 9, 12, 23, 59, tzinfo=pytz.utc)
#start = datetime(2022, 7, 23, 23, 59, tzinfo=pytz.utc)
rdb = tinydb.TinyDB("results_db_new.json")
q = tinydb.Query()

delta = today - start

# Get All Time
growth = get_account_growth(start, delta)
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

# last_update = max([x["time"] for x in rdb.all()])
# last_update = datetime.fromtimestamp(last_update).isoformat()
last_update = today.isoformat()
with open("aws_upload/ownership.json", "w+") as f:
    json.dump(get_ownership(last_update, hs*100), f)
s3_client.upload_file("aws_upload/ownership.json", BUCKET, "ownership.json")

shrs_in_accounts = sorted([float(a[1].rstrip())
                          for a in load_account_balances(today)])

stats_history = get_stats_history(start, today)
num_cs_accts = hs_payload["high"]
estimates = get_estimates(stats_history, num_cs_accts)

chart_data = {
    "labels": get_labels(start, delta),
    "stats": stats_history,
    "posts": get_posts(start, delta),
    "accounts": get_accounts(start, delta),
    "shares": get_shares(start, delta),
    "growth": growth,
    "distribution": get_histogram(shrs_in_accounts),
    "estimates": estimates
}

# with open("aws_upload/all_charts_pre.json", "w+") as f:
#     json.dump(chart_data, f)
# s3_client.upload_file("aws_upload/all_charts_pre.json", BUCKET, "all_charts_pre.json")

with open("aws_upload/all_charts.json", "w+") as f:
    json.dump(chart_data, f)
s3_client.upload_file("aws_upload/all_charts.json", BUCKET, "all_charts.json")

with open("aws_upload/charts/labels.json", "w+") as f:
    json.dump(chart_data['labels'], f)
s3_client.upload_file("aws_upload/charts/labels.json",
                      BUCKET, "charts/labels.json")

with open("aws_upload/charts/stats.json", "w+") as f:
    json.dump(chart_data['stats'], f)
s3_client.upload_file("aws_upload/charts/stats.json",
                      BUCKET, "charts/stats.json")

with open("aws_upload/charts/posts.json", "w+") as f:
    json.dump(chart_data['posts'], f)
s3_client.upload_file("aws_upload/charts/posts.json",
                      BUCKET, "charts/posts.json")

with open("aws_upload/charts/accounts.json", "w+") as f:
    json.dump(chart_data['accounts'], f)
s3_client.upload_file("aws_upload/charts/accounts.json",
                      BUCKET, "charts/accounts.json")

with open("aws_upload/charts/shares.json", "w+") as f:
    json.dump(chart_data['shares'], f)
s3_client.upload_file("aws_upload/charts/shares.json",
                      BUCKET, "charts/shares.json")

with open("aws_upload/charts/growth.json", "w+") as f:
    json.dump(chart_data['growth'], f)
s3_client.upload_file("aws_upload/charts/growth.json",
                      BUCKET, "charts/growth.json")

with open("aws_upload/charts/power.json", "w+") as f:
    json.dump(get_week_purchase_power(), f)
s3_client.upload_file("aws_upload/charts/power.json",
                      BUCKET, "charts/power.json")

with open("aws_upload/charts/distribution.json", "w+") as f:
    json.dump(chart_data['distribution'], f)
s3_client.upload_file("aws_upload/charts/distribution.json",
                      BUCKET, "charts/distribution.json")

with open("aws_upload/charts/estimates.json", "w+") as f:
    json.dump(chart_data['estimates'], f)
s3_client.upload_file("aws_upload/charts/estimates.json",
                      BUCKET, "charts/estimates.json")

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

# with open("aws_upload/all_stats_pre.json", "w+") as f:
#     json.dump(todays_stats, f)
# s3_client.upload_file("aws_upload/all_stats_pre.json", BUCKET, "all_stats_pre.json")

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
