const { getSdk } = require('balena-sdk');

const balena = getSdk({
  apiUrl: 'https://api.newbalena.ihost.net.ua/',
  dataDirectory: process.cwd() + '/data',
  debug: true
});

balena.models.device.serviceVar.getAllByDevice('27a9a563e6df5a2436e5bb115ebc8ae4').then(function(vars) {
  console.log(vars);
});

return false;




