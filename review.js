var IPHONE_REVIEW_SITE_URL = "http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=%s&mt=8&type=Purple+Software";
var ANDROID_REVIEW_SITE_URL ="market://details?id=%s";

var REVIEW_ENABLED = "review:enabled";
var REVIEW_CHECK = "review:check";
var REVIEW_ENABLE = "review:enable";
var REVIEW_DISABLE = "review:disable";
var REVIEW_NOTIFIED_AT = "review:notifiedAt";

var REVIEW_CALLBACKS = {
	'default': function() { createAlertDialog().show(); }
};

var appid = null;
var notifiedPeriod = 60 * 60 * 24 * 3;
var condition = function() { return true; };

var setAppId = function(id){
	appid = id;
};

var setCondition = function(callback) {
	condition = callback;
};

var setNotifiedPeriod = function(period) {
	notifiedPeriod = period;
};

var addEnabledCallback = function(callback) {
	if (typeof callback == "string") {
		callback = REVIEW_CALLBACKS[callback];
	}
	Ti.App.addEventListener(REVIEW_ENABLED, callback);
};

var removeEnabledCallback = function(callback) {
	if (typeof callback == "string") {
		callback = REVIEW_CALLBACKS[callback];
	}
	Ti.App.removeEventListener(REVIEW_ENABLED, callback);
};

var createAlertDialog = function(config){
	config = config || {}
	var title = config.title || "このアプリを利用していかがでしたでしょうか？";
	var message = config.message || "このアプリをレビューする時間を頂けたらうれしく思います。ご協力よろしくお願いします。";
	var reviewButton = config.review || "レビューする";
	var deferButton = config.defer || "後にする";
	var closeButton = config.close || "今後この質問を表示しない";
	
	var deferHidden = config.deferHidden;
	
	var buttonNames = [reviewButton];
	if (!deferHidden) buttonNames.push(deferButton);
	buttonNames.push(closeButton);
	
	var cancel = deferHidden ? 1 : 2;
	
	var dialog = Ti.UI.createAlertDialog({
		title: title,
		message: message,
		buttonNames: buttonNames,
		cancel: cancel
	});
	dialog.addEventListener('click', function(e){
		switch (e.index) {
			case 0:
				openSite();
			case cancel:
				disable();
				break;
			default:
				defer();
				break;
		}
	});
	return dialog;
};

var enabled = function(config){
	config = config || {};
	
	if (config.onlyCondition) {
		return condition();
	} else {
		var period = (new Date).getTime() - parseInt(Ti.App.Properties.getString(REVIEW_NOTIFIED_AT, 0)) / 1000;
		
		return Ti.App.Properties.getBool(REVIEW_ENABLED, true) &&
			period > notifiedPeriod && condition();
	}
};

var openSite = function(){
	if (Ti.Platform.osname == "iphone") {
		Ti.Platform.openURL(String.format(IPHONE_REVIEW_SITE_URL, appid));
	} else {
		var intent = Ti.Android.createIntent({
			action: Ti.Android.ACTION_VIEW,
			data: String.format(ANDROID_REVIEW_SITE_URL, appid)
		});
		intent.addCategory(Ti.Android.CATEGORY_BROWSABLE);
		
		var activity = Ti.Android.currentActivity;
		if (activity) {
			activity.startActivity(intent);
		}
	}
};

var enable = function(){
	Ti.App.Properties.setBool(REVIEW_ENABLED, true);
}

var disable = function(){
	Ti.App.Properties.setBool(REVIEW_ENABLED, false);
};

var defer = function(){
	Ti.App.Properties.setString(REVIEW_NOTIFIED_AT, (new Date).getTime());
};

var check = function(){
	Ti.App.fireEvent(REVIEW_CHECK);
};

Ti.App.addEventListener(REVIEW_CHECK, function() {
	if (enabled()) Ti.App.fireEvent(REVIEW_ENABLED);
});

Ti.App.addEventListener(REVIEW_ENABLE, function(){
	enable();
});

Ti.App.addEventListener(REVIEW_DISABLE, function(){
	disable();
});


exports.appid = setAppId;
exports.condition = setCondition;
exports.notifiedPeriod = setNotifiedPeriod;
exports.check = check;
exports.enabled = enabled;
exports.enable = enable;
exports.disable = disable;
exports.openSite = openSite;
exports.addEnabledCallback = addEnabledCallback;
exports.removeEnabledCallback = removeEnabledCallback;
exports.createAlertDialog = createAlertDialog;
