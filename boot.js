var BOOT_COUNT = "boot:count";
var FIRST_BOOT_TIME = "boot:firstTime";

var resumeTime = null;
var startTime = new Date;

var getCount = function(){
	return Ti.App.Properties.getInt(BOOT_COUNT, 0);
};

var setCount = function(count){
	return Ti.App.Properties.setInt(BOOT_COUNT, count);
};

var incrementCount = function(){
	setCount(getCount() + 1);
	setFirstTime();
	
	Ti.API.debug("boot count: " + getCount());
	Ti.API.debug("boot first time: " + String.formatTime(getFirstTime()) + ' ' + String.formatDate(getFirstTime(), "long"));
	Ti.API.debug("boot period: " + getPeriod());
};

var setFirstTime = function(){
	if (!getFirstTime()) {
		Ti.App.Properties.setString(FIRST_BOOT_TIME, startTime.getTime());
	};
};

var getFirstTime = function(){
	var time = Ti.App.Properties.getString(FIRST_BOOT_TIME, null);
	if (!time) return null;
	
	return new Date(parseInt(time));
};

var getStartTime = function(){
	return startTime;
};

var setResumeTime = function(){
	resumeTime = new Date;
};

var getResumeTime = function(){
	return resumeTime || startTime;
}

var getPeriod = function(config){
	config = config || {}
	config.criteria = config.criteria || 'first';
	config.unit = config.unit || 'sec';
	
	switch (config.criteria) {
		case 'first':
			var time = getFirstTime();
			break;
		case 'start':
			var time = getStartTime();
			break;
		case 'resume':
			var time = getResumeTime();
			break;
		default:
			var error = new Error;
			error.title = "bootCounter";
			error.message = String.format("'%s' is invalid criteria.", config.criteria);
			throw error;
	}
	
	if (!time) return 0;
	
	var sec = Math.floor(((new Date).getTime() - time.getTime()) / 1000);
	
	switch (config.unit) {
		case 'day':
			return Math.floor(sec / (24 * 3600));
		case 'hour':
			return Math.floor(sec / 3600);
		case 'min':
		case 'minute':
			return Math.floor(sec / 60);
		case 'sec':
		case 'second':
			return sec;
		default:
			var error = new Error;
			error.title = "bootCounter";
			error.message = String.format("'%s' is invalid unit.", config.unit);
			throw error;
	}
	
};

Ti.App.addEventListener('resume', function(){
	setResumeTime();
	incrementCount();
});


exports.firstTime = getFirstTime;
exports.startTime = getStartTime;
exports.resumeTime = getResumeTime;
exports.period = getPeriod;
exports.count = getCount;
exports.increment = incrementCount;
exports.initialize = incrementCount;
