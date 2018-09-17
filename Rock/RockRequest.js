var https = require('https');

const RockRequest = ( () => {

	let baseURL = '';
	let path = '';
	let filters = {};
	let authToken = null;

	return { 

		init: (opts) => {

			if( !opts.hasOwnProperty('baseURL') 
				&& (typeof opts['baseURL'] !== 'string') 
				&& (opts.path.length < 2) ){
				throw new Error('baseURL is required');
			}

			if( !opts.hasOwnProperty('path') 
				&& (typeof opts['path'] !== 'string') 
				&& (opts.path.length < 2) ){
				throw new Error('path is required');
			}

			if( !opts.hasOwnProperty('authToken') 
				&& (typeof opts['authToken'] !== 'string') 
				&& (opts.path.length < 2) ){
				throw new Error('Authorization Token is required');
			}

			baseURL = opts.baseURL;
			path = opts.path;
			authToken = opts.authToken;

			if(opts.hasOwnProperty(filters)){
				filters = Object.assign(filters, opts.filters);
			}
	
		},

		send: ()=>{
			let reqOptions = { 
            	host: baseURL, 
            	port: '443', 
            	path: endPoint, 
            	method: 'GET', 
            	headers: { 
                	'Content-Type': 'application/json', 
                	'Authorization-Token': 'PsUKsQGcqVMOWI6N6M6gxgu7'
            	} 
        	}
			return new Promise( (resolve,reject) => {

			} );
		}
	}

}());

exports.RockRequest = RockRequest;