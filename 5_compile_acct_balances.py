from datetime import datetime, timedelta
import pytz
import calendar as cal
import json
import multiprocessing
import boto3
from os.path import exists
from pymongo import MongoClient
from dotenv import dotenv_values

config = dotenv_values(".env")
mongo = MongoClient(config["DB_CONNECT_STR"])
db = mongo['computershared']['portfolios']
rolling_window = 180
today = (datetime.utcnow() - timedelta(days=1)).replace(hour=23,
                                                        minute=59, second=59, tzinfo=pytz.utc)

BUCKET = config["S3_BUCKET_NAME"]
session = boto3.Session(aws_access_key_id=config["AWS_KEY"],
                        aws_secret_access_key=config["AWS_SECRET"])
s3_client = session.client('s3')

def compile_account_balances(day: datetime, apes: list):
    accounts = []

    # Use yesterday as a starting point for today, but skip Apes who need recompile
    yesterday_file = f"aws_upload/account_balances2/{(day - timedelta(days=1)).strftime('%Y-%m-%d')}.csv"
    if not exists(yesterday_file):
        print(f"Yesterday file not found: {yesterday_file}")
        return

    # Drop accounts that fall outside rolling window
    drop_apes = []
    if rolling_window:
        rw = cal.timegm((day - timedelta(days=rolling_window)).utctimetuple())
        outside_window = list(db.find({"time": {"$lt": rw}}))
        outside_apes = list(set([p['u'] for p in outside_window]))
        inside_window = list(db.find({"time": {"$gte": rw}}))
        inside_apes = list(set([p['u'] for p in inside_window]))
        drop_apes = [a for a in outside_apes if a not in inside_apes]

    print(f"{len(drop_apes)} apes outside of rolling window as of {day}")

    with open(yesterday_file, 'r') as f:
        for line in f.readlines():
            items = line.split(',')
            if items[0] not in apes and items[0] not in drop_apes:
                age_days = int(items[2]) + 1
                power = float(items[3])
                if day.weekday() == 6:
                    age_weeks = max(age_days // 7, 1)
                    power = round(power * max(age_weeks - 1, 1) / age_weeks, 2)
                accounts.append(f"{items[0]},{items[1]},{age_days},{power}\n")

    # Process today's Apes
    e = cal.timegm(day.utctimetuple())
    processed = 0
    for ape in apes:
        # doublecheck end time is right
        apes_posts = list(db.find({"$and": [
            {"u": ape},
            {"time": {"$lte": e}}
        ]}))

        apes_accounts = max([p["accounts"] for p in apes_posts])
        apes_total = sum([p["delta_value"] for p in apes_posts])

        # Figure out purchasing power
        apes_first_post_time = min(p['time'] for p in apes_posts)
        ape_active_days = max((day - datetime.utcfromtimestamp(apes_first_post_time).replace(tzinfo=pytz.utc)).days, 1)
        ape_active_weeks = ape_active_days // 7
        ape_active_weeks = max(ape_active_weeks, 1)
        # Use an average cost basis for all apes since no way to know
        cost_basis = 37.5
        purchase_power = round(apes_total * cost_basis /
                               ape_active_weeks / apes_accounts, 2)

        # Store the average of each Apes accounts
        for i in range(0, apes_accounts):
            accounts.append(
                f"{ape},{round(apes_total / apes_accounts, 2)},{ape_active_days},{purchase_power}\n")
        
        processed += 1
        print(f"{round(processed/len(apes) * 100, 2)}% complete     ", end='\r')

    with open(f"aws_upload/account_balances2/{day.strftime('%Y-%m-%d')}.csv", 'w+') as f:
        for account in accounts:
            f.write(account)
    s3_client.upload_file(
       f"aws_upload/account_balances2/{day.strftime('%Y-%m-%d')}.csv", BUCKET, f"results/{day.strftime('%Y-%m-%d')}.csv")


if __name__ == "__main__":
    with open("earliest_update.txt", "r") as f:
        start_time_str = f.read()
    #start_time_str = "1631678712"
    start_time = datetime.fromtimestamp(int(start_time_str), tz=pytz.utc)
    start_time = start_time.replace(hour=0, minute=0, second=0)

    for i in range(0, (today - start_time).days+1):
        day = start_time + timedelta(days=i)
        end_of_day = day.replace(hour=23, minute=59, second=59)
        s = cal.timegm(day.utctimetuple())
        e = cal.timegm(end_of_day.utctimetuple())

        r = list(db.find({"$and": [
            {"time": {"$gt": s}},
            {"time": {"$lte": e}}
        ]}))

        days_apes = list(set([p['u'] for p in r]))
        print(f"Processing {len(days_apes)} apes for {day}")
        compile_account_balances(end_of_day, days_apes)