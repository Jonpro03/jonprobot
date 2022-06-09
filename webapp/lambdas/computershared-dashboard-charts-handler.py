import json
import boto3

def lambda_handler(event, context):
    BUCKET_NAME = "computershared-assets"
    s3 = boto3.resource('s3')
    
    timeframe = "all"
    env = "prd"
    try:
        env = event['queryStringParameters']['env']
        timeframe = event["queryStringParameters"]['time']
    except:
        pass

    if timeframe == "month":
        obj = s3.Object(BUCKET_NAME, "month_charts.json")
    elif timeframe == "week":
        obj = s3.Object(BUCKET_NAME, "week_charts.json")
    elif timeframe == "day":
        obj = s3.Object(BUCKET_NAME, "day_charts.json")
    else:
        if env == "prd":
            obj = s3.Object(BUCKET_NAME, "all_charts.json")
        else:
            obj = s3.Object(BUCKET_NAME, "all_charts_pre.json")

    data = json.loads(obj.get()['Body'].read().decode('utf-8'))
        
    # TODO implement
    return {
        'statusCode': 200,
        "isBase64Encoded": False,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Env': env
        },
        "multiValueHeaders": { 'Access-Control-Allow-Methods': ["OPTIONS", "GET"] },
        'body': json.dumps(data)
    }
