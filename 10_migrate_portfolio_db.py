import boto3
import tinydb
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Key

pdb = tinydb.TinyDB("portfolio_db.json")
sdb = tinydb.TinyDB("new_shares_db.json")

aws_region = "us-west-2"
aws_access_key = ""
aws_secret_access_key = ""
BUCKET = "computershared-reddit-images"

session = boto3.Session(aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret_access_key)
ddb = session.resource("dynamodb", region_name=aws_region)
portfolio_table = ddb.Table("computershared_portfolios")
purchases_table = ddb.Table("computershared_purchases")
receipt_table = ddb.Table("computershared_receipts")
s3_client = session.client('s3')

for pd in pdb.all():
    if pd["value"] == 0 or pd["audited"] == False or pd["image_path"] in ["", "None"]:
        continue
    a = portfolio_table.query(KeyConditionExpression=Key('id').eq(pd["id"]))["Count"]
    if a > 0:
        print(f"{pd['id']} already done.")
        continue

    image_name = pd["image_path"].split('/')[-1]
    s3_client.upload_file(pd["image_path"], BUCKET, image_name)

    record = {
        "id": pd["id"],
        "timestamp": datetime.utcfromtimestamp(pd["created"]).isoformat(),
        "author": pd["u"],
        "url": pd["url"],
        "sub": pd["sub"],
        "post_type": "portfolio",
        "image_url": pd["url"],
        "image_hash": pd["img_hash"],
        "image_text": pd["image_text"],
        "image_path": f"s3://{BUCKET}/{image_name}",
        "dupes": [],
        "shares": Decimal(str(pd["value"])),
    }

    portfolio_table.put_item(Item=record)
    print(f"{pd['id']} uploaded.")

