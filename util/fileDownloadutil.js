const s3 = require('./s3.config');
const config = require('config');
const logger = require('./log4jsutil');


exports.downloadFile = async function (file) {
    logger.debug("[FileDownloadUtil] :: downloadFile()");
    const s3Client = s3.s3Client;
    const downloadParamsRFQ = s3.downloadParamsRFQ;
    const downloadParamsLC = s3.downloadParamsLC;
    const downloadParamsPSdocs = s3.downloadParamsPSdocs;
    const downloadParamsCSdocs = s3.downloadParamsCSdocs;
    const downloadParamsSOQ = s3.downloadParamsSOQ;
    const downloadParamsCPDocs = s3.downloadParamsCPDocs;
    const downloadParamsHPW100 = s3.downloadParamsHPW100
    const downloadParamsSOQGeneratedDoc = s3.downloadParamsSOQGeneratedDoc;

    s3bucket = s3Client //new AWS.S3();
    let url = "";
    if (file.Id !== undefined) {
        downloadParamsRFQ.Key = file.Id + '.pdf';
        downloadParamsRFQ.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketRFQ');
        downloadParamsRFQ.ResponseContentDisposition = `inline; filename="${file.pdfName + '.pdf'}"`;
        url = String(s3bucket.getSignedUrl('getObject', downloadParamsRFQ));
    } else if (file.lcId !== undefined) {
        downloadParamsLC.Key = file.lcId + '.pdf'
        downloadParamsLC.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketLC');
        downloadParamsLC.ResponseContentDisposition = `inline; filename="${file.description + '.pdf'}"`;
        url = String(s3bucket.getSignedUrl('getObject', downloadParamsLC));
    } else if (file.psdocId !== undefined) {
        downloadParamsPSdocs.Key = file.psdocId + '.pdf'
        downloadParamsPSdocs.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketPS');
        downloadParamsPSdocs.ResponseContentDisposition = `inline; filename="${file.name + '.pdf'}"`;
        url = String(s3bucket.getSignedUrl('getObject', downloadParamsPSdocs));
    } else if (file.csdocId !== undefined) {
        downloadParamsCSdocs.Key = file.csdocId + '.pdf'
        downloadParamsCSdocs.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketCS');
        downloadParamsCSdocs.ResponseContentDisposition = `inline; filename="${file.name + '.pdf'}"`;
        url = String(s3bucket.getSignedUrl('getObject', downloadParamsCSdocs));
    } else if (file.soqId !== undefined) {
        downloadParamsSOQ.Key = file.soqId + '.pdf'
        downloadParamsSOQ.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketSOQ');
        downloadParamsSOQ.ResponseContentDisposition = `inline; filename="${file.pdfName}"`;
        url = String(s3bucket.getSignedUrl('getObject', downloadParamsSOQ));
    } else if (file.cpdocId !== undefined) {
        downloadParamsCPDocs.Key = file.cpdocId + '.pdf'
        downloadParamsCPDocs.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketCP');
        downloadParamsCPDocs.ResponseContentDisposition = `inline; filename="${file.name + '.pdf'}"`
        downloadParamsCPDocs.Expires = 10
        url = String(s3bucket.getSignedUrl('getObject', downloadParamsCPDocs));
    } else if (file.hpw100Id !== undefined) {
        downloadParamsHPW100.Key = file.hpw100Id + '.pdf'
        downloadParamsHPW100.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketHPW100');
        downloadParamsHPW100.ResponseContentDisposition = `inline; filename="${file.name + '.pdf'}"`
        downloadParamsHPW100.Expires = 10
        url = String(s3bucket.getSignedUrl('getObject', downloadParamsHPW100));
    } else if (file.soqGeneratedDocId !== undefined) {
        downloadParamsSOQGeneratedDoc.Key = file.soqGeneratedDocId + '.pdf'
        downloadParamsSOQGeneratedDoc.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketSOQ');
        downloadParamsSOQGeneratedDoc.ResponseContentDisposition = `inline; filename="${file.name + '.pdf'}"`
        downloadParamsSOQGeneratedDoc.Expires = 10
        url = String(s3bucket.getSignedUrl('getObject', downloadParamsSOQGeneratedDoc));
    }
    return url;
    //return url.split('?')[0]
}

exports.downloadZip = async function (soqData, callback, downloadOption) {
    logger.debug("[FileDownloadUtil] :: downloadZip()");
    const s3Client = s3.s3Client;
    s3bucket = s3Client //new AWS.S3();

    let params = [
        { Bucket: process.env.S3_BUCKETNAME + config.get('S3Config.BucketSOQ'), Key: soqData.soqId + ".pdf" },
        { Bucket: process.env.S3_BUCKETNAME + config.get('S3Config.BucketSOQ'), Key: soqData.generatedPdfId + ".pdf" },
    ]
    let hpw100 = [];

    if (soqData.hpw100Info !== null) {
        hpw100 = soqData.hpw100Info.split(','); // An array that contains all hpw100 Ids
        hpw100.forEach(item => {
            params.push({
                Bucket: process.env.S3_BUCKETNAME + config.get('S3Config.BucketHPW100'),
                Key: item.substring(0, item.indexOf("+")) + ".pdf"
            });
        });
    }

    let fileObject = []        // Array to be used to contain buffer data of files in S3 and file names of them
    let fileData = []          // Array to be used to contain buffer data of files in S3
    let filenames = []         // Array to be used to file names
    let filenamesWithExt = []  // Array to be used to file names with extension
    for (let i = 0; i < params.length; i++) {
        s3bucket.getObject(params[i], function (err, data) { // Getting S3 bucket data from relevant folders inside
            new Promise((resolve, reject) => {
                if (err) {
                    reject(err); // Passing error to catch block to log
                    hpw100 = [];
                    callback(err);
                } else {
                    resolve();
                }
            }).then(() => {
                fileData.push(data.Body);
                if (params[i].Key.replace(".pdf", "") === soqData.soqId) {
                    if (downloadOption == 'Id') {
                        filenames.push(`SOQ_${soqData.rfqTitle}_${soqData.GUID}_UPLOAD`);
                    } else if (downloadOption == 'Vendor') {
                        filenames.push(`SOQ_${soqData.rfqTitle}_${soqData.vendorName}_UPLOAD`);
                    }
                } else if (params[i].Key.replace(".pdf", "") === soqData.generatedPdfId) {
                    if (downloadOption == 'Id') {
                        filenames.push(`SOQ_${soqData.rfqTitle}_${soqData.GUID}`);
                    } else if (downloadOption == 'Vendor') {
                        filenames.push(`SOQ_${soqData.rfqTitle}_${soqData.vendorName}`);
                    }
                } else {
                    hpw100.forEach(item => {
                        if (item.indexOf(params[i].Key.replace(".pdf", "")) > -1) {
                            if (downloadOption == 'Id') {
                                filenames.push(`HPW100_${item.split("+").pop()}_${soqData.GUID}`);
                            } else if (downloadOption == 'Vendor') {
                                filenames.push(`HPW100_${item.split("+").pop()}_${soqData.vendorName}`);
                            }
                        }
                    })
                }

                if (fileData.length === params.length) {
                    filenames.forEach(item => {
                        item.replace(/[^\w\s]/gi, '');
                        item = item + ".pdf";
                        filenamesWithExt.push(item);
                    });
                    fileObject[0] = fileData;
                    fileObject[1] = filenamesWithExt;
                    fileObject[2] = soqData.soqId;
                    callback(fileObject);
                    console.log(fileObject)
                }
            }).catch((err) => {
                console.log(err)
            })
        });
        //console.log(s3bucket.getSignedUrl('getObject', params[i]))
    }
}

/** 
* CR #17
* Download All submissions for RFQ using SOQZipService
*/
exports.downloadSOQZip = async function (rfq, downloadOption) {
    logger.debug("[FileDownloadUtil] :: downloadSOQZip()");
    const s3Client = s3.s3Client;
    const s3bucket = s3Client//new AWS.S3();
    let key = "";
    if (downloadOption == "Id") {
        key = rfq.Id + '_GUID';
    } else if (downloadOption = "Vendor") {
        key = rfq.Id;
    }
    const zipFileName = rfq.title + '_SOQ_Submissions' + '.zip';
    const downloadParamsSOQZip = s3.downloadParamsSOQZip;
    downloadParamsSOQZip.Key = key + '.zip';
    downloadParamsSOQZip.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketRFQZip');
    downloadParamsSOQZip.ResponseContentDisposition = `attachment; filename="${zipFileName}"`
    downloadParamsSOQZip.Expires = 10;

    let downloadURL = "";
    try {
        await s3bucket.headObject({
            Key: downloadParamsSOQZip.Key,
            Bucket: downloadParamsSOQZip.Bucket
        }).promise(); // to determine if the key present in bucket
        downloadURL = s3bucket.getSignedUrl('getObject', downloadParamsSOQZip);
    } catch (err) {
        throw new Error(err.code);
    }
    return downloadURL;
}

// Get common files from S3
exports.getCommonFiles = async function (PDFName) {
    logger.debug("[FileDownloadUtil] :: getS3PDF()");
    const s3Client = s3.s3Client;
    const s3bucket = s3Client//new AWS.S3();
    try {
        const params = {
            Bucket: process.env.S3_BUCKETNAME + config.get('S3Config.BucketOther'),
            Key: PDFName
        }
        const data = await s3bucket.getObject(params).promise();
        return data.Body;
    } catch (e) {
        throw new Error(`Could not retrieve file from S3: ${e.message}`)
    }
}
