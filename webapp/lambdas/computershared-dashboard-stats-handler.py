import json
import boto3

def lambda_handler(event, context):
    BUCKET_NAME = "computershared-assets"
    s3 = boto3.resource('s3')
    
    timeframe = "all"
    bot = "scraper"
    
    try:
        timeframe = event["queryStringParameters"]['time']
    except:
        pass
    try:
        bot = event["queryStringParameters"]["bot"]
    except:
        pass
    
    if bot == "drsbot":
        drsbot = json.loads(s3.Object(BUCKET_NAME, "DRSBOT.json").get()['Body'].read().decode('utf-8'))
        data = {
            "sampled_accounts": float(str(drsbot['total_post_count']).replace(',', '')),
            "sampled_shares": float(str(drsbot['total_share_count']).replace(',', '')),
            #"average": float(str(drsbot['total_share_count']).replace(',', '')) / float(str(drsbot['total_post_count']).replace(',', '')),
            "average": float(str(drsbot['total_average']).replace(',', '')),
            "std_dev": float(str(drsbot['total_std_dev']).replace(',', '')),
            "median": float(str(drsbot['total_median']).replace(',', '')),
            "mode": float(str(drsbot['total_mode']).replace(',', '')),
            "accts_per_ape": float(str(drsbot['total_average_CS']).replace(',', '')),
            "account_high_score": float(str(drsbot['account_high_score']).replace(',', '')),
            "trimmed_average": float(str(drsbot['total_trimmed_average']).replace(',', '')),
        }
    else:
        if timeframe == "month":
            obj = s3.Object(BUCKET_NAME, "month_stats.json")
        elif timeframe == "week":
            obj = s3.Object(BUCKET_NAME, "week_stats.json")
        elif timeframe == "day":
            obj = s3.Object(BUCKET_NAME, "day_stats.json")
        else:
            obj = s3.Object(BUCKET_NAME, "all_stats.json")
        data = json.loads(obj.get()['Body'].read().decode('utf-8'))
        
    # TODO implement
    return {
        'statusCode': 200,
        "isBase64Encoded": False,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*'
        },
        "multiValueHeaders": { 'Access-Control-Allow-Methods': ["OPTIONS", "GET"] },
        'body': json.dumps(data)
    }
