import json
import boto3
import urllib3
from boto3.dynamodb.conditions import Key
from datetime import datetime

http = urllib3.PoolManager()

def lambda_handler(event, context):
    BUCKET_NAME = "computershared-reddit-images"
    API_KEY = ""
    API_SECRET = ""
    PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    session = boto3.Session()
    s3 = session.resource('s3')
    ddb = session.resource("dynamodb", region_name='us-west-2')
    ipfs_posts_table = ddb.Table('computershared_ipfs_posts')
    
    
    # Validate user
    redditBearer = event["queryStringParameters"]['redditBearer']
    post_id = event["queryStringParameters"]['postId']
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
    results = ipfs_posts_table.query(KeyConditionExpression=Key('id').eq(post_id))
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
                'IpfsHash': post['cid'],
                'isDuplicate': True,
                'PinSize': 0,
                'Timestamp': post_time
            })
        }
    
    headers = {
        'pinata_api_key': API_KEY,
        'pinata_secret_api_key': API_SECRET
    }

    s3img = image_path.split('/')[-1]
    s3img_bytes = s3.Object(BUCKET_NAME, s3img).get()['Body'].read()
    
    metadata = {
        'name': s3img,
        'keyvalues': {
            'u': user,
            'id': post_id,
            'link': post_link
        }
    }
    metadata = json.dumps(metadata)
    
    mpfd = {
        'file': ('file',s3img_bytes),
        'pinataMetadata': metadata
    }
    
    resp = http.request('POST',
                        PINATA_URL,
                        headers=headers,
                        fields=mpfd,
                        encode_multipart=True,
                        retries = False)
    
    if resp.status != 200:
        return {
            'statusCode': resp.status,
            "isBase64Encoded": False,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*'
            },
            "multiValueHeaders": { 'Access-Control-Allow-Methods': ["OPTIONS", "POST"] },
            'body': resp.data.decode('utf-8')
        }
    resp_body = json.loads(resp.data.decode('utf-8'))
    
    nft_metadata = json.dumps({
        "description": f"ComputerShare {post_type.capitalize()} by {user} on {datetime.utcfromtimestamp(post_time):%Y-%m-%d} shared to Reddit: https://redd.it/{post_id}. Minted on computershared.net",
        "image": f"ipfs://{resp_body['IpfsHash']}",
        "name": f"ComputerShare {post_type.capitalize()} by {user}",
        "royalty_percentage": 0
    })
    
    metadata = {
        'name': f"{s3img}_metadata",
        'keyvalues': {
            'u': user,
            'id': post_id,
            'link': post_link
        }
    }
    metadata = json.dumps(metadata)
    
    mpfd = {
        'file': ('file', str.encode(nft_metadata)),
        'pinataMetadata': metadata
    }
    
    resp = http.request('POST',
                        PINATA_URL,
                        headers=headers,
                        fields=mpfd,
                        encode_multipart=True,
                        retries = False)
    if resp.status == 200:
        resp_body = json.loads(resp.data.decode('utf-8'))
        record = {
            'id': str(post_id),
            'cid': str(resp_body['IpfsHash'])
        }
        ipfs_posts_table.put_item(Item=record)
        
    return {
        'statusCode': resp.status,
        "isBase64Encoded": False,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*'
        },
        "multiValueHeaders": { 'Access-Control-Allow-Methods': ["OPTIONS", "POST"] },
        'body': resp.data.decode('utf-8')
    }
