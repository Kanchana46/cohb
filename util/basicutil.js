var jwt = require('jsonwebtoken');
var config = require('config')

exports.generateRandomNum = async function () {
	var randomNum = await Math.floor(100000 + Math.random() * 900000);
	return String(randomNum);
};

exports.generateJWT = async function (users) {
	var token = jwt.sign({
		data: {
			id: users[0].Id,
			name: users[0].UserName,
			email: users[0].Email,
			company: users[0].Company
		}
	}, config.get('privatekey'), {
		expiresIn: config.get('AppSessionTime')
	});
	return String(token);
};

exports.decodeBase64 = async function (encodedValue) {
	//Decode Base64 Encoded value
	//convert from base64
	let buff = Buffer.from(encodedValue, 'base64');
	let utf = buff.toString('ascii');
	//convert from utf8
	buff = Buffer.from(utf, 'utf-8');
	let decodedStr = buff.toString('ascii');
	return decodedStr;
};

exports.replaceQuotes = function (text) {
	//replace single quotes and double quotes
	let singleQuoteRegex = /'/g;
	let doubleQuoteRegex = /"/g;
	return text.toString().replace(doubleQuoteRegex, '\"').replace(singleQuoteRegex, "''")
};

// Encode html elements
exports.encodeHTML = function (content) {
	var encodedStr = content.replace(/[\u00A0-\u9999<>&](?!#)/gim, function (i) {
		return '&#' + i.charCodeAt(0) + ';';
	});
	return encodedStr;
};

// Decode html elements
exports.decodeHTML = function (content) {
	var decodedStr = content.replace(/&#([0-9]{1,3});/gi, function (match, num) {
		return String.fromCharCode(parseInt(num));
	});
	return decodedStr;
};

// Replace &nbsp; by ' '
exports.replaceNbsps = function (content) {
	var replacedStr = content.replace(/&nbsp;/g, ' ');
	return replacedStr;
}

exports.getTokenUserId = function (req) {
	const token = req.headers["x-access-token"] || req.headers["authorization"];

	if (!token) return null
	try {
		const decodedToken = jwt.verify(token, config.get("privatekey"))
		return decodedToken.data.id
	} catch (ex) {
		return null
	}
}

// Replace <br> and <hr> tags
exports.replaceNoEndHTMLTag = function (content) {
	let replacedContent = content.replace(/<br>/g, '<![CDATA[<br>]]>').replace(/<hr>/g, '<![CDATA[<hr>]]>');
	return replacedContent;
}