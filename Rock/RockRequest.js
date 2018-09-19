const https = require('https');
const utils = require('./utils');

const RockRequest = ( () => {

	let baseURL = '';
	let path = '';
	let filters = {};
	let authToken = null;
	let initialized = false;
	let params = {};

	return { 

		init: (opts) => {

			if( !opts.hasOwnProperty('baseURL') 
				&& (typeof opts['baseURL'] !== 'string') 
				&& (opts.path.length < 2) ){
				throw utils.createRockSdkError('RockRequestError','baseURL is required');
			}

			if( !opts.hasOwnProperty('path') 
				&& (typeof opts['path'] !== 'string') 
				&& (opts.path.length < 2) ){
				throw utils.createRockSdkError('RockRequestError','path is required');
			}

			if( !opts.hasOwnProperty('authToken') 
				&& (typeof opts['authToken'] !== 'string') 
				&& (opts.path.length < 2) ){
				throw utils.createRockSdkError('RockRequestError','Authorization Token is required');
			}

			baseURL = opts.baseURL;
			path = opts.path;
			authToken = opts.authToken;

			if(opts.hasOwnProperty(filters)){
				filters = Object.assign(filters, opts.filters);
			}
	
		},

		addFilter: (filter) => {
			for(key in filter){
				filters[key] = filter[key];
			}
		},

		removeFilter: (filterName) => {
			delete filters[filterName];
		},

		setBaseUrl: (url)=>{
			baseUrl = url;
		},

		setAuthToken: (token)=>{
			authToken = token;
		},

		setPath: (p)=>{
			path = p
		},

		getFilterString:()=>{
			let out = '';
			if(!Object.keys(filters).length)
				return out;
			for(filterName in filters){
				out += filterName + ' eq ' + filters[filterName] + ' and ';
			}
			out = out.substring(0, out.lastIndexOf(' and '));
			return '?$filters=' + encodeURIComponent(out);
		},

		getParamModifiers: ()=>{
			let out = '';

			if(!Object.keys(params).length)
				return out;

			out += '&';

			for(paramName in params){
				out += paramName + '=' + params[paramName] + '&';
			}
			return out.substring(0, out.lastIndexOf('&'));
		},

		getFullPath: ()=>{

			let fullPath = '/api/';

			//Make sure the path does not already contain a starting or trailing slash
			while(path.charAt(0) === '/'){
				path = path.substring(1)
			}
			while(path.charAt(path.length - 1) === '/'){
				path = path.substring(0, path.lastIndexOf('/'));
			}

			fullPath += path + this.getFilterString() + this.getParamModifiers;

			return fullPath;
		},

		send: ()=>{

			if(!initialized){
				throw utils.createRockSdkError('RockRequestError','Request not initialized: You must first call the init method');
			}

			let reqOptions = { 
            	host: baseURL, 
            	port: '443', 
            	path: , 
            	method: 'GET', 
            	headers: { 
                	'Content-Type': 'application/json', 
                	'Authorization-Token': 'PsUKsQGcqVMOWI6N6M6gxgu7'
            	} 
        	}

			return new Promise( (resolve,reject) => {

				var req = https.request(options, (res) => {

		            res.setEncoding('utf8');

		            let returnData = "";
		            let out = {};

		            /**
		             * The amount of data returned at once can be limited by the
		             * server or the browser, so we need to make sure we
		             * are getting all of the returned data.
		             */
		            res.on('data', chunk => {
		                returnData = returnData + chunk;
		            });

		            res.on('end', () => {
		                // we have now received the raw return data in the returnData variable.
		                // We can see it in the log output via:
		                // console.log(JSON.stringify(returnData))
		                // we may need to parse through it to extract the needed data

		                out = JSON.parse(returnData);              

		                resolve(out);

		            });

		        });

		        req.on('error', (e) => {
		            console.error('REQUEST ERROR: ',e);
		            reject(e);
		        });

		        req.end();

			});
		}
	}

}());

exports.RockRequest = RockRequest;