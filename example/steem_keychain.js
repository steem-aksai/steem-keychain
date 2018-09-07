// Content script interfacing the website and the extension
var steem_keychain = {
	current_id: 1,
	requests: {},
	handshake_callback: null,

	requestHandshake: function(callback) {
		this.handshake_callback = callback;
		console.log("a");
		this.dispatchCustomEvent("swHandshake", "");
	},

	requestVerifyKey: function(account, message, key, callback) {
		var request = {
			type: "decode",
			username: account,
			message: message,
			method: key
		};

		this.dispatchCustomEvent("swRequest", request, callback);
	},

	requestPost: function(account, title, body, parent_perm, parent_account, json_metadata, permlink, callback) {
    var request = {
			type: "post",
			username: account,
			title: title,
			body: body,
			parent_perm: parent_perm,
			parent_username: parent_account,
			json_metadata: json_metadata,
			permlink: permlink
		};

		this.dispatchCustomEvent("swRequest", request, callback);
	},

	requestVote: function(account, permlink, author, weight, callback) {
    var request = {
			type: "vote",
			username: account,
			permlink: permlink,
			author: author,
			weight: weight
		};

		this.dispatchCustomEvent("swRequest", request, callback);
	},

	requestCustomJson: function(account, id, key, json, display_msg, callback) {
		var request = {
			type: "custom",
			username: account,
			id: id, //can be "custom", "follow", "reblog" etc.
			method: key, // Posting key is used by default, active can be specified for id=custom .
			json: json, //content of your json
			display_msg: display_msg
		};

		this.dispatchCustomEvent("swRequest", request, callback);
	},

	requestTransfer: function(account, to, amount, memo, currency, callback) {
		var request = {
			type: "transfer",
			to: to,
			amount: amount,
			memo: memo,
			currency: currency
		};

		this.dispatchCustomEvent("swRequest", request, callback);
	},

	// Send the customEvent
	dispatchCustomEvent: function(name, data, callback) {
		this.requests[this.current_id] = callback;
		data = Object.assign({ request_id: this.current_id }, data);
		document.dispatchEvent(new CustomEvent(name, { detail: data }));
		this.current_id++;
	},

	onGetResponse: function(response) {
		if(response && response.request_id) {
			if(this.requests[response.request_id]) {
				this.requests[response.request_id](response);
				delete this.requests[response.request_id];
			}
		}
	},

	onGetHandshake: function() {
		if(this.handshake_callback)
			this.handshake_callback();
	}
}