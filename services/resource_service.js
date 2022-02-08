const aws = require('aws-sdk')
var fs = require('fs-extra')
const logger = require('../util/log4jsutil');
var config = require('config')
const s3 = require('../util/s3.config');
let upload = require('../util/multer.config');
const uuidv1 = require('uuid/v1');
var empty = require('is-empty');
var path = require('path')
const resourceModel = require("../models/resourcedoc_model");
const logModel = require('../models/log_model')

const {
    SharedIniFileCredentials
} = require('aws-sdk');
const e = require('express');

exports.uploadResourceDoc = async function (files, fileName, vendorType) {
    const s3Client = s3.s3Client;
    const params = s3.uploadParams;
    if (files != 0) {
        for (var i = 0; i < files.length; i++) {
            const checkFileNameSame = await this.checkFileNameSame(fileName, files[i].originalname)
            if (vendorType == 'psVendor') {
                if (!empty(checkFileNameSame)) {
                    //upload PS vendor resource documents
                    params.Key = checkFileNameSame + '.pdf';
                    params.Body = files[i].buffer;
                    params.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketPS'),
                        params.ACL = config.get('S3Config.PublicACL')
                    params.ContentType = config.get('S3Config.ContentType')

                    await s3Client.upload(params, function (err, data) {
                        if (err) {
                            //console.log("Error", err.code)
                            throw new Error(err.code);
                        } else {
                            console.log("Upload success", data)
                        }
                    })

                    // var putObjectPromise = s3Client.putObject(params).promise();
                    // putObjectPromise.then(function (data) {
                    //     console.log(data);
                    // }).catch(function (err) {
                    //     console.log(err);
                    // });
                }
            } else {
                if (!empty(checkFileNameSame)) {
                    //upload CS vendor resource documents
                    params.Key = checkFileNameSame + '.pdf';
                    params.Body = files[i].buffer;
                    params.Bucket = process.env.S3_BUCKETNAME + config.get('S3Config.BucketCS'),
                        params.ACL = config.get('S3Config.PublicACL')
                    params.ContentType = config.get('S3Config.ContentType')

                    await s3Client.upload(params, function (err, data) {
                        if (err) {
                            //console.log("Error", err.code)
                            throw new Error(err.code);
                        } else {
                            console.log("Upload success", data)
                        }
                    })
                    // var putObjectPromise = s3Client.putObject(params).promise();
                    // putObjectPromise.then(function (data) {
                    //     console.log(data);
                    // }).catch(function (err) {
                    //     console.log(err);
                    // });

                }
            }
        }
    }
}

exports.checkFileNameSame = async function (fileList, fileName) {
    var isExists = ''
    let file = JSON.parse(fileList)
    for (var i = 0; i < file.length; i++) {
        let filename = file[i].fileName
        if (filename.replace(/\s/g, "") == fileName.replace(/\s/g, "")) {
            isExists = file[i].id
        }
    }
    return isExists;
}

exports.addResourceDoc = async function (vendorType, files, title, userId) {
    logger.debug("[resource_service] :: insertResourceDoc() : Start");
    let uploadedParams = []
    if (title != null) {
        const isAvailableDoc = await resourceModel.getResouceDocByName(title, vendorType)
        if (!empty(isAvailableDoc)) {
            let params = {
                id: isAvailableDoc[0].Id,
                fileName: files[0]
            }
            uploadedParams.push(params)
        } else {
            var newId = uuidv1()
            let params = {
                id: newId,
                fileName: files[0]
            }
            const resourceInsert = await resourceModel.insertResourceDoc(newId, title, vendorType)
            uploadedParams.push(params)
        }
        await logModel.addLog("Admin", config.get('ResourceTypes.ResourceDocument'),
            "Resource Document(s) - " + title + " added", userId == null ? '' : userId, userId == null ? '' : userId)
    } else {
        for (var i = 0; i < files.length; i++) {
            const isAvailableDoc = await resourceModel.getResouceDocByName(files[i].split('.').slice(0, -1).join('.'), vendorType)
            if (!empty(isAvailableDoc)) {
                let params = {
                    id: isAvailableDoc[0].Id,
                    fileName: files[i]
                }
                uploadedParams.push(params)
            } else {
                var id = uuidv1()
                let params = {
                    id: id,
                    fileName: files[i]
                }
                uploadedParams.push(params)
                const resourceInsert = await resourceModel.insertResourceDoc(id, files[i].split('.').slice(0, -1).join('.'), vendorType)
            }

        }
        await logModel.addLog("Admin", config.get('ResourceTypes.ResourceDocument'),
            "Resource Document(s) - " + files.map(e => { return e.split('.')[0] }).join(', ') + " added", userId == null ? '' : userId, userId == null ? '' : userId)
    }
    console.log('before adding log')
    //await logModel.addLog("Admin", config.get('ResourceTypes.ResourceDocument'), "Resource document - " + title + " added", userId == null ? '' : userId, userId == null ? '' : userId)

    logger.debug("[resource_service] :: getResouceDocByName() : End" + uploadedParams);
    return uploadedParams
}

exports.deleteResourceDocs = async function (resourceList, vendorType) {
    logger.debug("[resource_service] ::deleteResourceDoc() : Start")
    for (var i = 0; i < resourceList.length; i++) {
        const ResourceDelete = await resourceModel.deleteResourceDoc(resourceList[i].id, vendorType)
    }
    logger.trace("[resource_service] :: deleteResourceDoc()  : End");
}

exports.deleteResourceDoc = async function (Id, vendorType, userId) {
    logger.debug("[resource_service] ::deleteResourceDocument() : Start")
    const documentName = await resourceModel.getResourceDocumentById(Id, vendorType);
    const deletedResourceDocument = await resourceModel.deleteResourceDoc(Id, vendorType);
    if (deletedResourceDocument == 1) {
        await logModel.addLog("Admin", config.get('ResourceTypes.ResourceDocument'),
            "Resource Document(s) - " + documentName[0].Name + " deleted ", userId == null ? '' : userId, userId == null ? '' : userId)
    }
    logger.trace("[resource_service] :: deleteResourceDocument()  : End");
    return deletedResourceDocument;
}