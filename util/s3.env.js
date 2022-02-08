const env = {
  AWS_ACCESS_KEY: process.env.S3_BUCKETACCESSKEY, // change to yours
  AWS_SECRET_ACCESS_KEY: process.env.S3_BUCKETSECRETACCESSKEY, // change to yours
  REGION: process.env.S3_BUCKETREGION, // change to yours
  LAMBDA_REGION: process.env.LAMBDA_REGION
};

module.exports = env;