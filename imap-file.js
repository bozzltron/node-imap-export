  var fs = require('fs'), fileStream;
  var ImapConnection = require('./node_modules/imap').ImapConnection;

  var username, password;

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

// Connect
imap.connect(function(err){

  if(!err) {

    // Open INBOX
    imap.openBox('INBOX', false, function(err, box){

      if(!err){

        // Get Messages
        imap.search([ 'ALL', ['SINCE', 'August 20, 2012'] ], function(err, results) {
          if (err) die(err);
          var fetch = imap.fetch(results, {
            request: {
              headers: false,
              body: 'full'
            }
          });
          fetch.on('message', function(msg) {
            console.log('Got a message with sequence number ' + msg.seqno);
            fileStream = fs.createWriteStream('msg-' + msg.seqno + '-raw.txt');
            msg.on('data', function(chunk) {
              fileStream.write(chunk);
            });
            msg.on('end', function() {
              fileStream.end();
            });
          });
          fetch.on('end', function() {
            console.log('Done fetching all messages!');
            imap.logout(cb);
          });
        });

      }

    });
  }

});
