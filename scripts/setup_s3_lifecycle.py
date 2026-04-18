"""
S3 Lifecycle Policy Setup Script
Configures automatic deletion of photos after 30 days
"""

import boto3
import json
import os
from botocore.exceptions import ClientError

def setup_lifecycle_policy(bucket_name, days_to_retain=30):
    """
    Configure S3 lifecycle policy to automatically delete photos after retention period
    
    Args:
        bucket_name: S3 bucket name
        days_to_retain: Number of days to retain photos before deletion
    """
    s3_client = boto3.client('s3')
    
    lifecycle_config = {
        'Rules': [
            {
                'ID': 'DeleteProcessedPhotos',
                'Status': 'Enabled',
                'Filter': {
                    'Prefix': 'profiles/'
                },
                'Transitions': [
                    {
                        'Days': 7,
                        'StorageClass': 'STANDARD_IA'
                    },
                    {
                        'Days': 30,
                        'StorageClass': 'GLACIER'
                    },
                    {
                        'Days': 90,
                        'StorageClass': 'DEEP_ARCHIVE'
                    }
                ],
                'Expiration': {
                    'Days': days_to_retain
                },
                'NoncurrentVersionTransitions': [
                    {
                        'NoncurrentDays': 7,
                        'StorageClass': 'STANDARD_IA'
                    },
                    {
                        'NoncurrentDays': 30,
                        'StorageClass': 'GLACIER'
                    }
                ],
                'NoncurrentVersionExpiration': {
                    'NoncurrentDays': days_to_retain
                },
                'AbortIncompleteMultipartUpload': {
                    'DaysAfterInitiation': 7
                }
            }
        ]
    }
    
    try:
        s3_client.put_bucket_lifecycle_configuration(
            Bucket=bucket_name,
            LifecycleConfiguration=lifecycle_config
        )
        
        print(f"✅ Lifecycle policy configured for bucket: {bucket_name}")
        print(f"   Photos will be deleted after {days_to_retain} days")
        print(f"   Storage transitions: 7d -> STANDARD_IA, 30d -> GLACIER, 90d -> DEEP_ARCHIVE")
        
    except ClientError as e:
        print(f"❌ Error configuring lifecycle policy: {e}")
        raise

def get_lifecycle_policy(bucket_name):
    """Get current lifecycle policy for bucket"""
    s3_client = boto3.client('s3')
    
    try:
        response = s3_client.get_bucket_lifecycle_configuration(Bucket=bucket_name)
        print(f"Current lifecycle policy for {bucket_name}:")
        print(json.dumps(response, indent=2))
        return response
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchLifecycleConfiguration':
            print(f"No lifecycle policy configured for {bucket_name}")
            return None
        else:
            print(f"Error getting lifecycle policy: {e}")
            raise

if __name__ == "__main__":
    bucket_name = os.getenv('S3_BUCKET', 'ds3-identity-photos')
    days_to_retain = int(os.getenv('PHOTO_RETENTION_DAYS', '30'))
    
    print(f"Setting up lifecycle policy for bucket: {bucket_name}")
    print(f"Retention period: {days_to_retain} days\n")
    
    # Show current policy
    print("Current policy:")
    get_lifecycle_policy(bucket_name)
    print()
    
    # Setup new policy
    setup_lifecycle_policy(bucket_name, days_to_retain)
