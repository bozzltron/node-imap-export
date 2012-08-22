
var ImapConnection = require('./node_modules/imap').ImapConnection, 
		util = require('util'),
		fs = require('fs'),
		MailParser = require("./node_modules/mailparser").MailParser;		
    

var username, password , filepath = "", mailparser = new MailParser();

// print process.argv
process.argv.forEach(function (val, index, array) {
  
  if(val == '-u'){
  	
  	// Get username
  	if(array[index+1]) {
  		username = array[index+1]
  	} 

  }

  if(val == '-p'){
  	
  	// Get username
  	if(array[index+1]) {
  		password = array[index+1]
  	} 

  }

  if(val == '-f'){

  	// Get username
  	if(array[index+1]) {
  		filepath = array[index+1]
  	}   	

  }
  
});

// setup an event listener when the parsing finishes
mailparser.on("end", function(mail_object){
    console.log("From:", mail_object.from); //[{address:'sender@example.com',name:'Sender Name'}]
    console.log("Subject:", mail_object.subject); // Hello world!
    console.log("Text body:", mail_object.text); // How are you today?
});

// Setup file stream
var file = filepath ? filepath : "inbox.csv";
var csv = fs.createWriteStream(file, {'flags': 'a'});
csv.write('Date, From, To, Subject, Body,\n');

// Argument Input Validation
var valid = true;
if(!username){ console.log("Please provide a username."); valid=false; }
if(!password){ console.log("Please provide a password."); valid=false; }
if(!valid) process.exit(1);

// Setup IMAP
var imap = new ImapConnection({
  username: username,
  password: password,
  host: 'imap.gmail.com',
  port: 993,
  secure: true
});

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

// Connect
imap.connect(function(err){

	if(!err) {

		// Open INBOX
		imap.openBox('INBOX', false, function(err, box){

			if(!err){

				// Get Messages
				imap.search([ 'All', ['SINCE', 'August 1, 2012'] ], function(err, results){

					// Fetch Data
			    var fetch = imap.fetch(results, { request: { headers:false, body:'full' } });
			    fetch.on('message', function(msg) {

			      msg.on('end', function() {

			      	// send the email source to the parser
							mailparser.write(msg);
							mailparser.end();

			        // Write to the file
			        // var headers = msg.headers;
			        // var string = [safeString(headers.date[0]), Email.parse(headers.from[0]).join(' '), Email.parse(headers.to[0]).join(' '), safeString(headers.subject[0]), safeString('body')].join(', ') + ', \n';
			        // csv.write(string);

			      });

			    });

			    fetch.on('end', function() {
			      console.log('Done fetching all messages!');
			      imap.logout(function(){});
			    });

				});

			}

		});
	}

});



