// node samples/sample.js
var csv = require('csv');

// String process function
function safeString(str) {
	if(str == null) str = '';
	return str.replace(/[&\/\\#,+()$~%'"*<>{}]/g,'');
}

// Parse email
function parseEmail(str){
	var ary = str.split(' ');
	return ary[ary.length - 1];
}

var Email = {
    pattern: /([^<]+)\s<(.*)>/gi,
    parse: function(text) {
        return text.match(this.pattern);
    }
};


csv()
.fromPath(__dirname+'/index.csv')
.toPath(__dirname+'/pulse-inbox.csv')
.transform(function(data){
    //[safeString(data[0]), Email.parse(data[1]).join(' '), Email.parse(data[2]).join(' '), safeString(data[3]), safeString('body')];
    return data;
})
.on('data',function(data,index){
    console.log('#'+index+' '+JSON.stringify(data));
})
.on('end',function(count){
    console.log('Number of lines: '+count);
})
.on('error',function(error){
    console.log(error.message);
});
