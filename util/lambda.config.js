const AWS = require('aws-sdk');
const env = require('./s3.env.js');

if (!process.env.NODE_ENV) {
    AWS.config.update({
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    });
}

const lambda = new AWS.Lambda({
    region: env.LAMBDA_REGION
});

const params = {
    FunctionName: process.env.RFQ_LAMBDA_SERVICE, /* required */
    Payload: 'true'
}

const cpParams = {
    FunctionName: process.env.CP_LAMBDA_SERVICE, /* required */
    Payload: ''
}

const AWSLambda = {}

AWSLambda.lambda = lambda;
AWSLambda.params = params;
AWSLambda.cpParams = cpParams;

module.exports = AWSLambda;