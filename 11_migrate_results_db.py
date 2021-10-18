import boto3
import tinydb
from datetime import datetime, date
from decimal import Decimal
from boto3.dynamodb.conditions import Key
import yfinance as yf

gme = yf.Ticker("GME")
close_val = gme.info["regularMarketPreviousClose"]

pdb = tinydb.TinyDB("results_db.json")

aws_region = "us-west-2"
aws_access_key = "AKIAVYTUBMKT4PXAZIUE"
aws_secret_access_key = "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"
BUCKET = "computershared-reddit-images"

session = boto3.Session(aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret_access_key)
ddb = session.resource("dynamodb", region_name=aws_region)
results_table = ddb.Table("results")

for pd in pdb.all():
    if pd["value"] == 0:
        continue
    a = results_table.query(KeyConditionExpression=Key('u').eq(pd["u"]))["Count"]
    if a > 0:
        print(f"{pd['u']} already done.")
        continue

    images = [x.split('/')[-1] for x in pd["images"]]

    shares = pd["value"] if pd["type"] == "portfolio" else pd["value"]/close_val

    record = {
        "u": pd["u"],
        "ts": datetime.utcfromtimestamp(pd["time"]).isoformat(),
        "urls": pd["urls"],
        "images": images,
        "shares": Decimal(str(shares)),
    }

    returncode = results_table.put_item(Item=record)
    print(f"{pd['u']} uploaded {returncode}.")

# all_items = results_table.scan()

# items = [x for x in all_items["Items"] if datetime.fromisoformat(x["timestamp"]) > datetime(2021, 10, 10, 0, 0)]

# print(len(items))
# print("ohai")