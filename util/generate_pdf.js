var express = require('express');
var logger = require('../util/log4jsutil');
var fs = require('fs');
var s3 = require('../util/s3.config');
var AWS = require('aws-sdk')
var config = require('config')
var jsreport = require('jsreport-core')({
	tasks: {
		timeout: 600000
	}
});
var xsltProcessor = require('xslt-processor')
var xsltProcess = xsltProcessor.xsltProcess
var xmlParse = xsltProcessor.xmlParse
var path = require('path')
jsreport.use(require('jsreport-fop-pdf')({
	maxOutputSize: (1024 * 1000 * 1000)
}))
jsreport.init()

exports.generate = async function (xmlString, xslTemplateName, docId) {
	logger.debug("[generate_pdf] :: generate() : Start");
	return new Promise(function (resolve, reject) {
		try {
			//generate fo content
			var outXmlString = xsltProcess(
				xmlParse(xmlString),
				xmlParse(fs.readFileSync(path.join(__dirname, '/xsl/' + xslTemplateName + '.xsl')).toString())
			);
			outXmlString = outXmlString.replace(/&amp;gt;/g, '&gt;').replace(/&amp;lt;/g, '&lt;') 
			
			//generate the pdf using fo content
			jsreport.render({
				template: {
					content: outXmlString,
					recipe: 'fop-pdf',
					engine: 'none'
				}
			}).then(function (res) {
				const s3Client = s3.s3Client;
				const uploadParams = s3.uploadParams;

				if (xslTemplateName == "soq") {
					uploadParams.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketSOQ')
				} else if (xslTemplateName == "hpw100") {
					uploadParams.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketHPW100')
				}

				uploadParams.Key = docId + '.pdf';
				uploadParams.ACL = config.get('S3Config.AuthenticatedACL')
				uploadParams.ContentType = config.get('S3Config.ContentType')
				uploadParams.Body = res.result

				//upload the generated pdf 
				s3Client.upload(uploadParams, function (err, data) {
					if (err) {
						reject(err)
					} else {
						resolve(data)
						console.log(data)
					}
				})
				logger.debug("[generate_pdf] :: generate() : PDF file saved");
				logger.debug("[generate_pdf] :: generate() : End");
			}).catch(function (err) {
				reject(err)
			})

		} catch (err) {
			logger.debug("[generate_pdf] :: generate() : End");
			reject(err);
		}
	});
}