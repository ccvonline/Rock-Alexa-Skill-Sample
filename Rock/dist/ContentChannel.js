const Rock = require('./RockRequest');

const ContentChannel = ( function(){
	
	const ContentChannel = () => {
	};

	ContentChannel.init = (opts) => {

		let request = Rock.RockRequest;

		opts.path = 'ContentChannelItems';
		opts.requestMethod = 'GET';
		request.init(opts);

		return {
			request,
			send: request.send,
			filterByDate: function(dateObj){
				dateObj = dateObj || new Date();
				request.addFilter({"day(StartDateTime)": dateObj.getDate()});
				return this;
			},
			filterByMonth: function(dateObj){
				dateObj = dateObj || new Date();
				request.addFilter({"month(StartDateTime)": dateObj.getMonth()});
				return this;
			},
			filterByYear: function(dateObj){
				dateObj = dateObj || new Date();
				request.addFilter({"Year(StartDateTime)": dateObj.getFullYear() });
				return this;
			},
			filterByChannelId: function(id){
				request.addFilter({"ContentChannelId":id});
				return this;
			}
		}

	};

	return ContentChannel;

}());

exports.ContentChannel = ContentChannel;

