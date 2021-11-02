import boto3
import tinydb
from datetime import datetime, date, timedelta, timezone
from time import mktime
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
today = (datetime.utcnow() - timedelta(days=1)).replace(hour=23, minute=59, second=59)

def get_ownership(last_update):
    return {
        "last_update": last_update,
        "computershare_accounts": 74000,
        "total_outstanding": 75591496,
        "insider": 14712003,
        "institutional": 23500000,
        "etfs": 6600000,
        "mfs": 16900000,
        "inst_fuckery": 6500000
    }

def get_statistics(data_set):
    return {
        "sampled_accounts": len(data_set),
        "sampled_shares": float(round(sum(data_set), 2)),
        "std_dev": float(round(statistics.stdev(data_set), 2)),
        "median": float(round(statistics.median(data_set), 2)),
        "mode": float(round(statistics.mode(data_set), 2)),
        "average": float(round(statistics.mean(data_set), 2))
    }

def get_charts(start, delta, delta_unit="days"):
    rdb = tinydb.TinyDB("results_db.json")
    pfdb = tinydb.TinyDB("portfolio_db.json")
    nsdb = tinydb.TinyDB("new_shares_db.json")
    q = tinydb.Query()

    labels = []
    posts = []
    accounts = []
    shares = []
    averages = []

    range_unit = delta.days if delta_unit == "days" else 24
    range_unit += 1
    s = mktime(start.timetuple())

    # Aggregates
    for i in range(1, range_unit):
        end = start + (timedelta(days=i) if delta_unit == "days" else timedelta(hours=i))
        e = mktime(end.timetuple())
        ppd = len(pfdb.search((q.created >= s) & (q.created < e)))
        ppd += len(nsdb.search((q.created >= s) & (q.created < e)))
        posts.append(ppd)
        if delta_unit == "days":
            labels.append(f"{end.month}/{end.day}")
        else:
            labels.append(str(end.hour))

        r = rdb.search((q.time > s) & (q.time <= e))
        results = [x["value"] for x in r if x["value"] > 0]

        count_results = len(results)
        sum_results = sum(results)
        avg = 0
        if count_results != 0:
            avg = sum_results/count_results
        accounts.append(count_results)
        shares.append("{:.2f}".format(sum_results))
        averages.append("{:.2f}".format(avg))
    
    # Histogram
    data = np.array(results)
    hist, bins = np.histogram(data, bins=np.geomspace(1, 32768, num=16))
    hist = np.append(hist, [0])
    hist = [str(round(x)) for x in hist]
    bins = [str(round(x)) for x in bins]

    # Dailies
    daily_accts = []
    daily_shares = []
    delta = timedelta(days=1) if delta_unit == "days" else timedelta(hours=1)
    for i in range(1, range_unit):
        end = start + delta
        s = mktime(start.timetuple())
        e = mktime(end.timetuple())

        r = rdb.search((q.time > s) & (q.time <= e))
        accts = [x["value"] for x in r if x["value"] > 0]

        count_results = len(accts)
        sum_results = sum(accts)
        daily_accts.append(count_results)
        daily_shares.append("{:.2f}".format(sum_results))
        start = end

    return {
        "labels": labels,
        "posts": posts,
        "accounts": accounts,
        "shares": shares,
        "averages": averages,
        "dist_labels": bins,
        "dist_values": hist,
        "daily_accts": daily_accts,
        "daily_shares": daily_shares
    }


rdb = tinydb.TinyDB("results_db.json")
q = tinydb.Query()

last_update = max([x["time"] for x in rdb.all()])
last_update = datetime.fromtimestamp(last_update).isoformat()

with open("aws_upload/ownership.json", "w+") as f:
    json.dump(get_ownership(last_update), f)
s3_client.upload_file("aws_upload/ownership.json", BUCKET, "ownership.json")

# Get All Time
start = datetime(2021, 9, 13, 0, 0)
delta = today - start
s = mktime(start.timetuple())
e = mktime(today.timetuple())
result_set = [r["value"] for r in rdb.search((q.value > 0) & (q.time > s) & (q.time <= e))]
all_time_stats = get_statistics(result_set)
all_time_charts = get_charts(start, delta)

with open("aws_upload/all_stats.json", "w+") as f:
    json.dump(all_time_stats, f)
s3_client.upload_file("aws_upload/all_stats.json", BUCKET, "all_stats.json")

with open("aws_upload/all_charts.json", "w+") as f:
    json.dump(all_time_charts, f)
s3_client.upload_file("aws_upload/all_charts.json", BUCKET, "all_charts.json")

# Get Month
delta = timedelta(days=30)
start = today - delta
s = mktime(start.timetuple())
e = mktime(today.timetuple())
result_set = [r["value"] for r in rdb.search((q.value > 0) & (q.time > s) & (q.time <= e))]
month_stats = get_statistics(result_set)
month_charts = get_charts(start, delta)

with open("aws_upload/month_stats.json", "w+") as f:
    json.dump(month_stats, f)
s3_client.upload_file("aws_upload/month_stats.json", BUCKET, "month_stats.json")


with open("aws_upload/month_charts.json", "w+") as f:
    json.dump(month_charts, f)
s3_client.upload_file("aws_upload/month_charts.json", BUCKET, "month_charts.json")


# Get Week
delta = timedelta(days=7)
start = today - delta
s = mktime(start.timetuple())
e = mktime(today.timetuple())
result_set = [r["value"] for r in rdb.search((q.value > 0) & (q.time > s) & (q.time <= e))]
week_stats = get_statistics(result_set)
week_charts = get_charts(start, delta)

with open("aws_upload/week_stats.json", "w+") as f:
    json.dump(week_stats, f)
s3_client.upload_file("aws_upload/week_stats.json", BUCKET, "week_stats.json")

with open("aws_upload/week_charts.json", "w+") as f:
    json.dump(week_charts, f)
s3_client.upload_file("aws_upload/week_charts.json", BUCKET, "week_charts.json")


# Get Day
delta = timedelta(days=1)
start = today - delta
s = mktime(start.timetuple())
e = mktime(today.timetuple())
result_set = [r["value"] for r in rdb.search((q.value > 0) & (q.time > s) & (q.time <= e))]
day_stats = get_statistics(result_set)
day_charts = get_charts(start, delta, delta_unit="hours")

with open("aws_upload/day_stats.json", "w+") as f:
    json.dump(day_stats, f)
s3_client.upload_file("aws_upload/day_stats.json", BUCKET, "day_stats.json")

with open("aws_upload/day_charts.json", "w+") as f:
    json.dump(day_charts, f)
s3_client.upload_file("aws_upload/day_charts.json", BUCKET, "day_charts.json")
