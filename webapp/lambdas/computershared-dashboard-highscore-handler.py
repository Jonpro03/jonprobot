import json
import boto3

def lambda_handler(event, context):
    BUCKET_NAME = "computershared-assets"
    s3 = boto3.resource('s3')
    
    obj = s3.Object(BUCKET_NAME, "highscores.json")

    data = json.loads(obj.get()['Body'].read().decode('utf-8'))
        
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