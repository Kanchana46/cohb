const AWS = require('aws-sdk');
const env = require('./s3.env.js');

if (!process.env.NODE_ENV) {
	AWS.config.update({
		accessKeyId: env.AWS_ACCESS_KEY,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		region: env.REGION
	});
}

const s3Client = new AWS.S3({});

const uploadParams = {
	Bucket: '',
	Key: '', // pass key
	Body: null, // pass file body
	ACL: '',
	ContentType: ''
};

const downloadParamsRFQ = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: '',
	//ContentType:''
};

const downloadParamsLC = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: ''
};

const downloadParamsPSdocs = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: ''
};

const downloadParamsCSdocs = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: ''
};

const downloadParamsSOQ = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: ''
};

const downloadParamsCPDocs = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: '',
	Expires: ''
}

const downloadParamsHPW100 = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: '',
	Expires: ''
}

const downloadParamsSOQGeneratedDoc = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: '',
	Expires: ''
}

const downloadParamsSOQZip = {
	Bucket: '',
	Key: '', // pass key
	ResponseContentDisposition: '',
	Expires: ''
}

const s3 = {};
s3.s3Client = s3Client;
s3.uploadParams = uploadParams;
s3.downloadParamsRFQ = downloadParamsRFQ;
s3.downloadParamsLC = downloadParamsLC;
s3.downloadParamsPSdocs = downloadParamsPSdocs;
s3.downloadParamsCSdocs = downloadParamsCSdocs;
s3.downloadParamsSOQ = downloadParamsSOQ;
s3.downloadParamsCPDocs = downloadParamsCPDocs;
s3.downloadParamsHPW100 = downloadParamsHPW100
s3.downloadParamsSOQGeneratedDoc = downloadParamsSOQGeneratedDoc;
s3.downloadParamsSOQZip = downloadParamsSOQZip;

module.exports = s3;