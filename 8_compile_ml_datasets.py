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


def get_growth_ml_data(start: datetime, days: timedelta, rdb: tinydb.TinyDB) -> (list, list):
    q = tinydb.Query()
    new_drs = []
    growth_drs = []

    for i in range(1, days.days):
        end = start + timedelta(days=1)
        s = cal.timegm(start.utctimetuple())
        e = cal.timegm(end.utctimetuple())
        result_set = rdb.search((q.time > s) & (q.time <= e) & (q.delta_value > 0))
        all_shares = sum([a["delta_value"] for a in result_set])
        growth = sum([a["delta_value"] for a in result_set if a["delta_value"] != a["displayed_value"]])
        new = max(all_shares - growth, 0)
        date_fmt = "%Y-%m-%j %H:%M:%S" #YYYY-MM-DD HH:MM:SS
        new_drs.append(new)
        growth_drs.append(growth)

        start = end
    return (new_drs, growth_drs)


start = datetime(2021, 9, 20, 23, 59, tzinfo=pytz.utc)
#start = datetime(2021, 12, 5, 23, 59, tzinfo=pytz.utc)
rdb = tinydb.TinyDB("results_db_new.json")
q = tinydb.Query()

delta = today - start

res = get_growth_ml_data(start, delta, rdb)
