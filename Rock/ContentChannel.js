const Rock = require('./RockRequest');
const utils = require('./utils.js');

'use strict';

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};

const ContentChannel = ( ()=>{
	
	const ContentChannel = (opts) => {
		opts.path = 'ContentChannelItems';
		let RockRequest = Rock.RockRequest.init(opts);

		return __assign({}, RockRequest);
	}

	return ContentChannel;

}());

exports.ContentChannel = ContentChannel

