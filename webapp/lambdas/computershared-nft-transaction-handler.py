import json
import boto3
import urllib3
from boto3.dynamodb.conditions import Key
from time import time
from decimal import Decimal

http = urllib3.PoolManager()

def lambda_handler(event, context):
    session = boto3.Session()
    s3 = session.resource('s3')
    ddb = session.resource("dynamodb", region_name='us-west-2')
    mint_transact_table = ddb.Table('computershared_mint_transactions')
    
    redditBearer = event["queryStringParameters"]['redditBearer']
    post_id = event["queryStringParameters"]['postId']
    amount = event["queryStringParameters"]['amount']
    token = event["queryStringParameters"]['token']
    
    # Validate user
    headers = {"Authorization": "bearer "+redditBearer}
    reddit_auth_url = "https://oauth.reddit.com/api/v1/me"
    resp = http.request('GET',
                        reddit_auth_url,
                        headers=headers)
    if (resp.status != 200):
        return {
            'statusCode': resp.status,
            'body': json.dumps(resp.data.decode('utf-8'))
        }
    user = json.loads(resp.data.decode('utf-8'))['name']
    
    user_posts_url = "https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/posts/"+user
    resp = http.request('GET', user_posts_url)
    posts = json.loads(resp.data.decode('utf-8'))['Items']
    image_path = None
    for post in posts:
        if post['id']['S'] == post_id:
            image_path = post['image_path']['S']
            post_link = post['url']['S']
            post_time = int(post['timestamp']['N'])
            post_type = post['post_type']['S']
            break

    if not image_path:
        return {
                'statusCode': 404,
                'body': f"Post {post_id} not found by user {user}."
        }
    
    # Check if we've already processed this post
    results = mint_transact_table.query(KeyConditionExpression=Key('id').eq(post_id))
    if results['Count'] > 0:
        post = results['Items'][0]
        return {
            'statusCode': 200,
            "isBase64Encoded": False,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*'
            },
            "multiValueHeaders": { 'Access-Control-Allow-Methods': ["OPTIONS", "POST"] },
            'body': json.dumps({
                'status': 'Existing',
                'amount': float(post['amount']),
                'token': post['token'],
                'timestamp': int(post['timestamp'])
            })
        }
    
    record_time = int(time())
    record = {
        'id': str(post_id),
        'amount': Decimal(amount),
        'token': token,
        'timestamp': record_time
    }
    mint_transact_table.put_item(Item=record)
    

        
    return {
        'statusCode': 201,
        "isBase64Encoded": False,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*'
        },
        "multiValueHeaders": { 'Access-Control-Allow-Methods': ["OPTIONS", "POST"] },
        'body': json.dumps({
                'status': 'Entered',
                'amount': float(amount),
                'token': token,
                'timestamp': record_time
            })
        }
