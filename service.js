var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'VR Remote Control',
  description: 'Remote control for manage steam games',
  script: 'C:\\websites\\iisnode\\app.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();