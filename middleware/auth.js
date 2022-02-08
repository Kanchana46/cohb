const empty = require( 'is-empty' );
const jwt = require( "jsonwebtoken" );
const config = require( "config" );
const userModel = require( "../models/user_model" )
const logger = require( '../util/log4jsutil' );
const basicUtil = require( '../util/basicutil' )
const userLoginInfoModel = require( '../models/userlogininfo_model' )

module.exports = async function ( req, res, next ) {
	//get the token from the header if present
	const token = req.headers[ "x-access-token" ] || req.headers[ "authorization" ];
	//if no token found, return response (without going to the next middelware)
	if ( !token ) return res.status( 401 ).json( {
		status: {
			code: 401,
			name: "Unauthorized",
			message: "Unauthorized"
		},
		payload: null
	} );

	try {
		const decodedToken = await jwt.verify( token, config.get( "privatekey" ) )
		let userId = decodedToken.data.id
		const deviceIdEnc = req.headers[ 'device-id' ];
		const deviceId = await basicUtil.decodeBase64( deviceIdEnc )
		const result = await userModel.getUserById( userId )
		if ( empty( result ) ) {            
			logger.error( "[auth] :: error : Invalid user id" );
			res.status( 440 ).json( {
				status: {
					code: 440,
					name: "Error",
					message: "Invalid token credential."
				},
				payload: null
			} );
		} else {
            const loginInfoData = await userLoginInfoModel.getUserLoginInfo( userId, deviceId );
			if ( !empty( loginInfoData ) && new Date( loginInfoData[ 0 ].SessionExpiryTime) > new Date() ) {
				next()
			} else {
				logger.error( "[auth] :: error : Session Expired" );
				res.status( 440 ).json( {
					status: {
						code: 440,
						name: "Error",
						message: "Session Expired."
					},
					payload: null
				} );
			}
		}
	} catch ( ex ) {
		//if invalid token
		logger.error( "[auth] :: error : " + ex.message );
		if ( ex.message === 'jwt expired' ) {
			logger.debug( "[auth] :: expiredAt : " + ex.expiredAt );
			res.status( 440 ).json( {
				status: {
					code: 440,
					name: "Error",
					message: "jwt expired"
				},
				payload: null
			} );
		} else {
			res.status( 440 ).json( {
				status: {
					code: 440,
					name: "Error",
					message: "Invalid token."
				},
				payload: null
			} );
		}
	}
};