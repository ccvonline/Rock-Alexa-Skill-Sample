const Rock = require('./RockRequest');

const __assign = (this && this.__assign) || Object.assign || function(t) {
	for (var s, i = 1, n = arguments.length; i < n; i++) {
		s = arguments[i];
		for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
			t[p] = s[p];
	}
	return t;
};

const ContentChannel = ( function(){
	
	const ContentChannel = () => {};

	ContentChannel.init = (opts) => {
		opts.path = 'ContentChannelItems';
		opts.requestMethod = 'GET';
		let request = Rock.RockRequest;
		request.init(opts);
		console.log('Request', request);
		return request;
	};

	return ContentChannel;

}());

exports.ContentChannel = ContentChannel;

