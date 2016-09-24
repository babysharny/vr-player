var cp = require('child_process');
var exe = require('path').normalize('./vendor/WinSendKeys/WinSendKeys.exe');
var shell = require('shelljs');

module.exports = {

  observeApp: function() {  
    console.log('ok');
    
    var windowName = '[ACTIVE]';
    windowName = ' Viewer';
    // windowName = '[REGEXPTITLE:Task]';
    var keyStrokes = '!{TAB}' ;

    console.log('keys' + keyStrokes);
    var keys = keyStrokes.replace('^','^^');
    keys = '"'+keys+'"';

    var cmd = [exe,'-w',windowName, keys].join(' ');
    console.log('cmd', cmd);
    cp.exec(cmd, function(err, stdout, stderr) { 
      console.log('########');
      
      console.log(err);
      console.log(stdout);
      console.log(stderr);

      console.log('to left done');
    });

    this.myFunc();
  },

  observeConfig: function(app) {
    console.log('start observe ' + app);
    var timeout = 15;
    var loop = setInterval(
      function() {
        this.sendKeys('!{TAB}', ' Viewer');
        console.log(timeout + ' Send enter to config window ', app);
        
        timeout--;
        if (timeout < 1) {
          clearInterval(loop);  
        }
      }.bind(this),
      1000);

  },

  sendKeys(keys, window) {

    console.log('keys: ' + keys);
    var keys = keys.replace('^','^^');
    keys = '"'+keys+'"';

    var cmd = [exe, '-w', window, keys].join(' ');
    console.log('cmd', cmd);

    cp.exec(cmd, function(err, stdout, stderr) { 
      console.log('########');
      console.log(err);
      console.log(stdout);
      console.log(stderr);

      console.log('Send keys "'+ keys +'" to: '+ window + ' done.');
    });
  },

  myFunc: function() {
    console.log('OKAY!');
  }

};