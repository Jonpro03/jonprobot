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
import requests

aws_region = "us-west-2"
aws_access_key = "AKIAVYTUBMKTYWMWYU34"
aws_secret_access_key = "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"
BUCKET = "computershared-assets"

session = boto3.Session(aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret_access_key)
s3_client = session.client('s3')


#today = datetime.today().replace(hour=19, minute=0, second=0)
today = (datetime.utcnow() - timedelta(days=1)).replace(hour=23,
                                                        minute=59, second=59, tzinfo=pytz.utc)
epoch = datetime(1970, 1, 1)


def get_growth_ml_data(start: datetime, days: timedelta, rdb: tinydb.TinyDB) -> (list, list):
    q = tinydb.Query()
    new_drs = []
    growth_drs = []

    for i in range(1, days.days):
        end = start + timedelta(days=1)
        s = cal.timegm(start.utctimetuple())
        e = cal.timegm(end.utctimetuple())
        result_set = rdb.search((q.time > s) & (
            q.time <= e) & (q.delta_value > 0))
        all_shares = sum([a["delta_value"] for a in result_set])
        growth = round(sum([a["delta_value"]
                     for a in result_set if a["delta_value"] != a["displayed_value"]]))
        new = round(max(all_shares - growth, 0))
        new_drs.append(new)
        growth_drs.append(growth)

        start = end
    return new_drs, growth_drs


def get_hs_ml_data():
    filename = "aws_upload/highscores.json"
    with open(filename, "r") as hs_file:
        highscore_data = json.loads(hs_file.read())
    return highscore_data["high"]


start = datetime(2021, 9, 20, 23, 59, tzinfo=pytz.utc)
delta = today - start - timedelta(days=5)

rdb = tinydb.TinyDB("results_db_new.json")
q = tinydb.Query()

test_start = start + timedelta(days=int(delta.days * 0.55))

hs_data = get_hs_ml_data()
eighty_pct = int(len(hs_data) * 0.55)
hs_train = hs_data[:eighty_pct]
hs_test = hs_data[eighty_pct:]

new_drs, growth_drs = get_growth_ml_data(start, delta, rdb)
eighty_pct = int(delta.days * 0.55)
new_drs_train = new_drs[:eighty_pct]
new_drs_test = new_drs[eighty_pct:]
growth_drs_train = growth_drs[:eighty_pct]
growth_drs_test = growth_drs[eighty_pct:]

date_fmt = "%Y-%m-%d %H:%M:%S"  # YYYY-MM-DD HH:MM:SS
hs_train_set = {"start": start.strftime(date_fmt), "target": hs_train}
hs_test_set = {"start": test_start.strftime(date_fmt), "target": hs_test}

shares_train_set = [
    {"start": start.strftime(date_fmt), "target": new_drs_train, "cat": [0]},
    {"start": start.strftime(date_fmt), "target": growth_drs_train, "cat": [1]},
]

shares_test_set = [
    {"start": test_start.strftime(date_fmt), "target": new_drs_test, "cat": [0]},
    {"start": test_start.strftime(date_fmt), "target": growth_drs_test, "cat": [1]},
]

# with open("aws_upload/hs_all.csv", "w+") as f:
#     f.write("highscore\n")
#     for d in hs_data:
#         f.write(str(d) + "\n")
# s3_client.upload_file("aws_upload/hs_all.csv", BUCKET, "ml/hs/hs_all.csv")

with open("aws_upload/hs_train.jsonl", "w+") as f:
    f.write(json.dumps(hs_train_set) + "\n")
s3_client.upload_file("aws_upload/hs_train.jsonl", BUCKET, "ml/hs/train/train.json")

with open("aws_upload/hs_test.jsonl", "w+") as f:
    f.write(json.dumps(hs_test_set) + "\n")
s3_client.upload_file("aws_upload/hs_test.jsonl", BUCKET, "ml/hs/test/test.json")

with open("aws_upload/shares_train.jsonl", "w+") as f:
    for line in shares_train_set:
        f.write(json.dumps(line) + "\n")
s3_client.upload_file("aws_upload/shares_train.jsonl", BUCKET, "ml/shares/train/train.json")

with open("aws_upload/shares_test.jsonl", "w+") as f:
    for line in shares_test_set:
        f.write(json.dumps(line) + "\n")
s3_client.upload_file("aws_upload/shares_test.jsonl", BUCKET, "ml/shares/test/test.json")

endpoint_url = "https://runtime.sagemaker.us-west-2.amazonaws.com/endpoints/shares-predicttor-2022-03-28-21-30-20-069/invocations"
endpoint_name = "shares-predicttor-2022-03-28-21-30-20-069"

client = session.client('sagemaker-runtime', region_name="us-west-2")
content_type = accept = "application/json"
payload = {
    "instances": [
        {
            "start": test_start.strftime(date_fmt),
            "target": new_drs_test,
            "cat": [0]
        }
    ],
    "configuration": {
        "num_samples": len(new_drs_test),
        "output_types": ["mean", "quantiles", "samples"],
        "quantiles": ["0.1", "0.5", "0.9"]
    }
}

response = client.invoke_endpoint(
    EndpointName=endpoint_name,
    ContentType=content_type,
    Accept=accept,
    Body=json.dumps(payload)
)

result = json.loads(response['Body'].read().decode())
pred_start_date = test_start + timedelta(days=len(new_drs_test))
predictions = result["predictions"][0]
predictions["title"] = "New Shares"
predictions["starting"] = pred_start_date.strftime(date_fmt)
print(predictions)
with open("predictions.json", "w+") as f:
    json.dump(predictions, f, indent=4)