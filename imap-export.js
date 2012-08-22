
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
    console.log('headers', mail_object.headers.date);

    // Write to the file
    var string = [safeString(mail_object.headers.date), parseEmails(mail_object.from), parseEmails(mail_object.to), safeString(mail_object.subject), safeString(mail_object.text)].join(', ') + ', \n';
    csv.write(string);    
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
function parseEmails(ary){
  console.log(ary);
	var addresses = [];
	ary.forEach(function(item) {
		addresses.push(item.address);
	})
	console.log('addresses', addresses);
	return addresses.length > 0 ? addresses.join(' ') : '';
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
        imap.search([ 'ALL', ['SINCE', 'August 20, 2000'] ], function(err, results) {
          if (err) die(err);
          var fetch = imap.fetch(results, {
            request: {
              headers: false,
              body: 'full'
            }
          });
          fetch.on('message', function(msg) {
          	var email = "";
            console.log('Got a message with sequence number ' + msg.seqno);
            //fileStream = fs.createWriteStream('msg-' + msg.seqno + '-raw.txt');
            msg.on('data', function(chunk) {
              //fileStream.write(chunk);
              email += chunk;
            });
            msg.on('end', function() {
              //fileStream.end();
              mailparser.write(email);
              mailparser.end();
            });
          });
          fetch.on('end', function() {
            console.log('Done fetching all messages!');
            imap.logout();
          });
        });

			}

		});
	}

});



