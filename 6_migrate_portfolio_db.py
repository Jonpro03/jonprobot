import boto3
import tinydb
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr
import pytz

anon_apes = []

pdb = tinydb.TinyDB("portfolio_db.json")
sdb = tinydb.TinyDB("new_shares_db.json")
q = tinydb.Query()

aws_region = "us-west-2"
aws_access_key = ""
aws_secret_access_key = ""
BUCKET = "computershared-reddit-images"

session = boto3.Session(aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret_access_key)
ddb = session.resource("dynamodb", region_name=aws_region)
posts_table = ddb.Table("computershared_posts")
s3_client = session.client('s3')

starting_at = 1642006339

for pd in pdb.search(q.created >= starting_at):
    if (pd['u'] in anon_apes):
        continue
    if pd["value"] == 0 or pd["audited"] == False:# or pd["image_path"] in ["", "None"]:
        continue
    a = posts_table.query(
        KeyConditionExpression=Key('u').eq(pd['u']) & Key('id').eq(pd['id'])
        )["Count"]
    if a > 0:
        print(f"{pd['id']} already done.")
        continue

    image_name = pd["image_path"].split('/')[-1]
    try:
        s3_client.head_object(BUCKET, image_name)
    except:
        try:
            s3_client.upload_file(pd["image_path"], BUCKET, image_name)
        except:
            pass
    
    try:
        record = {
            "timestamp": Decimal(str(pd["created"])),
            "u": pd["u"],
            "id": pd["id"],
            "url": pd["url"],
            "sub": pd["sub"],
            "audited": pd["audited"],
            "post_type": "portfolio",
            "image_url": pd["url"],
            "image_hash": pd["img_hash"],
            "image_text": pd["image_text"],
            "image_path": f"s3://{BUCKET}/{image_name}",
            "dupes": [],
            "shares": Decimal(str(pd["value"])),
        }

        posts_table.put_item(Item=record)
    except:
        continue
    print(f"{pd['id']} uploaded.")

for sd in sdb.search(q.created > starting_at):
    if (sd['u'] in anon_apes):
        continue
    if sd["value"] == 0 or sd["audited"] == False: # or sd["image_path"] in ["", "None"]:
        continue
    a = posts_table.query(
        KeyConditionExpression=Key('u').eq(sd['u']) & Key('id').eq(sd['id'])
        )["Count"]
    if a > 0:
        print(f"{sd['id']} already done.")
        continue

    image_name = sd["image_path"].split('/')[-1]
    try:
        s3_client.head_object(BUCKET, image_name)
    except:
        try:
            s3_client.upload_file(sd["image_path"], BUCKET, image_name)
        except:
            pass

    try:
        record = {
            "timestamp": Decimal(str(sd["created"])),
            "u": sd["u"],
            "id": sd["id"],
            "url": sd["url"],
            "sub": sd["sub"],
            "audited": sd["audited"],
            "post_type": "purchase",
            "gme_price": Decimal(str( sd["gme_price"] if "gme_price" in sd else "170.0")),
            "image_url": sd["url"],
            "image_hash": sd["img_hash"],
            "image_text": sd["image_text"],
            "image_path": f"s3://{BUCKET}/{image_name}",
            "dupes": [],
            "shares": Decimal(str(sd["value"] / (sd["gme_price"] or 170.0))),
        }

        posts_table.put_item(Item=record)
    except:
        continue
    print(f"{sd['u']} uploaded.")
