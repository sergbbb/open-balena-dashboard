import { getOsName, getOsPath } from './functions';

require('dotenv').config();
const fs = require('fs');
const shell = require('shelljs');
const axios = require('axios');
const Datastore = require('nedb');
const imagefs = require('resin-image-fs');
const jwt = require('jsonwebtoken');
const { getSdk } = require('balena-sdk');

let db = {};
db.apps = new Datastore({ filename: process.cwd() + '/data/apps.db', autoload: true });
db.devices = new Datastore({ filename: process.cwd() + '/data/devices.db', autoload: true });
db.devices_vars = new Datastore({ filename: process.cwd() + '/data/devices_vars.db', autoload: true });
db.devices_vars.ensureIndex({ fieldName: 'deviceId' }, function (err) {});
db.ssh_keys = new Datastore({ filename: process.cwd() + '/data/ssh_keys.db', autoload: true });

let pub_ssh_key_for_devices = '';
fs.readFile(process.cwd() + '/api/devices.pub', "utf8", (err, pub_ssh_key) => {
  if (!err) {
    pub_ssh_key_for_devices = pub_ssh_key.trim();
  }
});

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

import express from 'express';
let zip = require('express-zip');

const app = express();

let balena = getSdk({
    apiUrl: process.env.OPENBALENA_API_URL,
    dataDirectory: process.cwd() + '/data',
    // debug: process.env.NODE_ENV !== 'production',
    debug: false
});

const CONNECTIONS_FOLDER = '/system-connections';
const SPLASH_FOLDER = '/splash';
function wifi_config_string(wifiSsid, wifiKey) {
  return `[connection]
interface-name=wlan0
id=resin-wifi
type=wifi

[wifi]
hidden=true
mode=infrastructure
ssid=${wifiSsid}

[wifi-security]
auth-alg=open
key-mgmt=wpa-psk
psk=${wifiKey}

[ipv4]
method=auto

[ipv6]
addr-gen-mode=stable-privacy
method=auto`;
}

balena.auth.login({email: process.env.OPENBALENA_API_EMAIL, password: process.env.OPENBALENA_API_PASSWORD}, function(error) {});

setInterval(() => {
  balena.auth.login({email: process.env.OPENBALENA_API_EMAIL, password: process.env.OPENBALENA_API_PASSWORD}, function(error) {});
}, 600000)

//////////////////////////////////////////////////////////////////////////////////////////////////////////// CHECK JWT
app.use((req, res, next) => {
  if(req.path !== '/login' && req.path !== '/logout' && req.path.indexOf('/os/download') === -1) {
    if (!req.headers.authorization) {
      return res.status(403).json({ error: 'No credentials sent!' });
    }
    try {
      let decoded = jwt.verify(req.headers.authorization, process.env.APP_PASSWORD);
    } catch(err) {
      return res.status(401).json({ message: 'Bad credentials' });
    }
  }
  next();
});

app.get('/', (req, res) => {
    res.status(200).send('This is openBalena api !!!');
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////// AUTH SECTION
app.post('/login', (req, res) => {
    if (req.body.username === process.env.APP_LOGIN && req.body.password === process.env.APP_PASSWORD) {
        let token = jwt.sign({ username: req.body.username }, req.body.password);
        req.session.authUser = process.env.APP_LOGIN;
        req.session.jwt = token;
        return res.json({ username: process.env.APP_LOGIN, token: token, path: req.path });
    }
    res.status(401).json({ message: 'Bad credentials' });
});

app.all('/logout', (req, res) => {
    res.json({ ok: true });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////// APP SECTION
app.get('/apps', (req, res) => {
    balena.models.application.getAll().then(function(applications) {
        res.status(200).json({ apps: applications});
    });
});


// NOT WORK
app.get('/appsWithDeviceServiceDetails', (req, res) => {
    res.status(200).send('NOT WORK');
    // balena.models.application.getAllWithDeviceServiceDetails().then(function(applications) {
    //     res.status(200).json({ apps: applications});
    // })
});

app.get('/app/create', (req, res) => {
    let appName = req.query.appName;
    let deviceType = req.query.deviceType;

    balena.models.application.create({ name: appName, deviceType: deviceType, organization: 1 }).then(function(application) {
        res.status(200).json({ app: application});
    });
});

app.get('/app/:appName', (req, res) => {
    let appName = req.params.appName;
    if(isNumber(appName)) {
        appName = parseInt(appName);
    }
    balena.models.application.get(appName).then(function(application) {
        res.status(200).json({ app: application});
    });
});

app.get('/app/:appId/purge', (req, res) => {
  let appId = parseInt(req.params.appId);
  balena.models.application.purge(appId, function (error) {
    if (error) {
      res.status(200).json({ success: false, error: error});
    } else {
      res.status(200).json({ success: true});
    }
  });
});

app.get('/app/:appName/restart', (req, res) => {
  let appName = req.params.appName;
  balena.models.application.restart(appName, function (error) {
    if (error) {
      res.status(200).json({ success: false, error: error});
    } else {
      res.status(200).json({ success: true});
    }
  });
});

app.get('/app/:appId/reboot', (req, res) => {
  let appId = parseInt(req.params.appId);
  balena.models.application.reboot(appId, {force: false}, function (error) {
    if (error) {
      res.status(200).json({ success: false, error: error});
    } else {
      res.status(200).json({ success: true});
    }
  });
});

app.get('/app/:appId/shutdown', (req, res) => {
  let appId = parseInt(req.params.appId);
  balena.models.application.shutdown(appId, {force: false}, function (error) {
    if (error) {
      res.status(200).json({ success: false, error: error});
    } else {
      res.status(200).json({ success: true});
    }
  });
});

app.get('/app/:appName/remove', (req, res) => {
  let appName = req.params.appName;
  balena.models.application.remove(appName).then(function() {
    res.status(200).json({ success: true});
  });
});

app.get('/app/:appName/devices', (req, res) => {
    let appName = req.params.appName;
    balena.models.device.getAllByApplication(appName).then(function(devices) {
        res.status(200).json({ devices: devices});
    });
});

app.get('/app/:appName/setCustomLocation', (req, res) => {
    let appName = req.params.appName;
    let lng = parseFloat(req.query.lng);
    let lat = parseFloat(req.query.lat);

    let app_db = { _id: appName
        , lng: lng
        , lat: lat
    };

    db.apps.update({ _id: appName }, app_db, {upsert: true}, function (error, newDoc) {
        if (error) {
            res.status(200).json({ success: false, error: error});
        } else {
            res.status(200).json({ success: true});
        }
    });
});

app.get('/app/:appName/getCustomLocation', (req, res) => {
    let appName = req.params.appName;
    let lng = parseInt(req.query.lng);
    let lat = parseInt(req.query.lat);

    db.apps.findOne({ _id: appName }, function (error, application) {
        if(application) {
            res.status(200).json({ location: application});
        } else {
            res.status(200).json({ location: {lat: 55.751244, lng: 37.618423}});
        }
    });

});
////////////////////////////////////////////////////////////////////////////////////////////////// APP configVar SECTION
app.get('/app/:appName/configVar/getAll', (req, res) => {
    let appName = req.params.appName;
    balena.models.application.configVar.getAllByApplication(appName).then(function(vars) {
        res.status(200).json({ vars: vars});
    });
});

app.get('/app/:appName/configVar/set', (req, res) => {
    let appName = req.params.appName;
    let key = req.query.key;
    let value = req.query.value;
    balena.models.application.configVar.set(appName, key, value).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/app/:appName/configVar/get', (req, res) => {
    let appName = req.params.appName;
    let key = req.query.key;
    balena.models.application.configVar.get(appName, key).then(function(value) {
        res.status(200).json({ value: value});
    });
});

app.get('/app/:appName/configVar/remove', (req, res) => {
    let appName = req.params.appName;
    let key = req.query.key;
    balena.models.application.configVar.remove(appName, key).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/app/:appName/configVar/change', (req, res) => {
    let appName = req.params.appName;
    let key = req.query.key;
    let value = req.query.value;
    balena.models.application.configVar.remove(appName, key).then(function() {
        balena.models.application.configVar.set(appName, key, value).then(function() {
            res.status(200).json({ success: true});
        });
    });
});
///////////////////////////////////////////////////////////////////////////////////////////////// APP enVar SECTION
app.get('/app/:appName/envVar/getAll', (req, res) => {
    let appName = req.params.appName;
    balena.models.application.envVar.getAllByApplication(appName).then(function(vars) {
        res.status(200).json({ envVars: vars});
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////// APP serviceVar SECTION
app.get('/app/:appName/serviceVar/getAll', (req, res) => {
    let appName = req.params.appName;
    balena.models.service.var.getAllByApplication(appName).then(function(vars) {
        res.status(200).json({ serviceVars: vars});
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////// APP services SECTION
app.get('/app/:appName/services', (req, res) => {
    let appName = req.params.appName;
    balena.models.service.getAllByApplication(appName).then(function(services) {
        res.status(200).json({ services: services});
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////// RELEASES SECTION
app.get('/release/getAllByApplication', (req, res) => {
    let nameOrId = req.query.nameOrId;
    if(isNumber(nameOrId)) {
        nameOrId = parseInt(nameOrId);
    }

    balena.models.release.getAllByApplication(nameOrId).then(function(releases) {
        res.status(200).json({ releases: releases});
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////// SERVICES SECTION
app.get('/service/getAllByApplication', (req, res) => {
    let nameOrId = req.query.nameOrId;
    if(isNumber(nameOrId)) {
        nameOrId = parseInt(nameOrId);
    }

    balena.models.service.getAllByApplication(nameOrId).then(function(services) {
        res.status(200).json({ services: services});
    });
});
//////////////////////////////////////////////////////////////////////////////////////////// SERVICES serviceVar SECTION
app.get('/service/:serviceId/serviceVar/getAll', (req, res) => {
    let serviceId = req.params.serviceId;
    balena.models.service.var.getAllByService(serviceId).then(function(vars) {
        res.status(200).json({ serviceVars: vars});
    });
});

app.get('/service/:serviceId/serviceVar/get', (req, res) => {
    let serviceId = req.params.serviceId;
    let key = req.query.key;

    balena.models.service.var.get(serviceId, key).then(function(value) {
        res.status(200).json({ value: value});
    });
});

app.get('/service/:serviceId/serviceVar/set', (req, res) => {
    let serviceId = req.params.serviceId;
    let key = req.query.key;
    let value = req.query.value;
    balena.models.service.var.set(serviceId, key, value).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/service/:serviceId/serviceVar/remove', (req, res) => {
    let serviceId = req.params.serviceId;
    let key = req.query.key;
    balena.models.service.var.remove(serviceId, key).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/service/:serviceId/serviceVar/change', (req, res) => {
    let serviceId = req.params.serviceId;
    let key = req.query.key;
    let value = req.query.value;
    balena.models.service.var.remove(serviceId, key).then(function() {
        balena.models.service.var.set(serviceId, key, value).then(function() {
            res.status(200).json({ success: true});
        });
    });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////// DEVICES TYPE SECTION
app.get('/deviceType/getAll', (req, res) => {
  balena.models.deviceType.getAll({ $select: ['name', 'slug', 'id', 'logo'] }).then(function(deviceTypes) {
    res.status(200).json({ deviceTypes: deviceTypes});
  })
});

//////////////////////////////////////////////////////////////////////////////////////////////////////// DEVICES SECTION
// 626983af2da7afdf51cb762ad2eedc22
app.get('/device/getSupportedDeviceTypes', (req, res) => {
    balena.models.device.getSupportedDeviceTypes().then(function(supportedDeviceTypes) {
        res.status(200).json({ supportedDeviceTypes: supportedDeviceTypes});
    });
});

app.get('/device/getDeviceSlug', (req, res) => {
    let deviceTypeName = req.query.deviceTypeName;
    balena.models.device.getDeviceSlug(deviceTypeName).then(function(deviceTypeSlug) {
        res.status(200).json({ deviceTypeSlug: deviceTypeSlug});
    });
});

app.get('/device/getDisplayName', (req, res) => {
    let deviceTypeSlug = req.query.deviceTypeSlug;
    balena.models.device.getDisplayName(deviceTypeSlug).then(function(deviceTypeName) {
        res.status(200).json({ deviceTypeName: deviceTypeName});
    });
});


app.get('/device/:uuid', (req, res) => {
    let uuid = req.params.uuid;
    balena.models.device.getWithServiceDetails(uuid).then(function(device) {
      res.status(200).json({ success: true, device: device});
    });
});

app.get('/device/:uuid/has', (req, res) => {
  let uuid = req.params.uuid;
  balena.models.device.has(uuid).then(function(hasDevice) {
    res.status(200).json({ hasDevice: hasDevice});
  });
});

app.get('/device/:uuid/register', (req, res) => {
  let uuid = req.params.uuid;
  let appName = req.query.appName;

  balena.models.device.register(appName, uuid, function(error, registrationInfo) {
    if (error) {
      res.status(200).json({ success: false, error: error})
    } else {
      res.status(200).json({ success: true});
    }
  });
});

app.get('/device/:uuid/rename', (req, res) => {
    let uuid = req.params.uuid;
    let NewName = req.query.NewName;
    balena.models.device.rename(uuid, NewName).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/device/:uuid/note', (req, res) => {
    let uuid = req.params.uuid;
    let note = req.query.note;
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    balena.models.device.note(uuid, note);
    res.status(200).json({ success: true});
});

app.get('/device/:uuid/move', (req, res) => {
    let uuid = req.params.uuid;
    let applicationNameOrId = req.query.applicationNameOrId;
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    db.devices_vars.remove({ deviceId: uuid }, { multi: true }, function (err, numRemoved) {});

    balena.models.device.move(uuid, applicationNameOrId);
    res.status(200).json({ success: true});
});

app.get('/device/:uuid/identify', (req, res) => {
    let uuid = req.params.uuid;
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    balena.models.device.identify(uuid);
    res.status(200).json({ success: true});
});

app.get('/device/:uuid/reboot', (req, res) => {
    let uuid = req.params.uuid;
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    balena.models.device.reboot(uuid, function(error) {
      if (error) {
        res.status(200).json({ success: false, error: error})
      } else {
        res.status(200).json({ success: true});
      }
    });

});

app.get('/device/:uuid/shutdown', (req, res) => {
  let uuid = req.params.uuid;
  if(isNumber(uuid)) {
    uuid = parseInt(uuid);
  }

  balena.models.device.shutdown(uuid, function(error) {
    if (error) {
      res.status(200).json({ success: false, error: error})
    } else {
      res.status(200).json({ success: true});
    }
  });

});

app.get('/device/:uuid/remove', (req, res) => {
  let uuid = req.params.uuid;
  if(isNumber(uuid)) {
    uuid = parseInt(uuid);
  }

  balena.models.device.remove(uuid, function(error) {
    if (error) {
      res.status(200).json({ success: false, error: error})
    } else {
      res.status(200).json({ success: true});
    }
  });

});

app.get('/device/:uuid/getSupervisorState', (req, res) => {
  let uuid = req.params.uuid;
  if(isNumber(uuid)) {
    uuid = parseInt(uuid);
  }

  balena.models.device.getSupervisorState(uuid, function(state) {
      res.status(200).json(state);
  });

});

app.get('/device/:uuid/restartApplication', (req, res) => {
  let uuid = req.params.uuid;
  if(isNumber(uuid)) {
    uuid = parseInt(uuid);
  }

  balena.models.device.restartApplication(uuid, function(error) {
    if (error) {
      res.status(200).json({ success: false, error: error})
    } else {
      res.status(200).json({ success: true});
    }
  });

});

app.get('/device/:uuid/purge', (req, res) => {
  let uuid = req.params.uuid;
  if(isNumber(uuid)) {
    uuid = parseInt(uuid);
  }

  balena.models.device.purge(uuid, function(error) {
    if (error) {
      res.status(200).json({ success: false, error: error})
    } else {
      res.status(200).json({ success: true});
    }
  });

});

app.get('/device/:uuid/startService', (req, res) => {
    let uuid = req.params.uuid;
    let imageId = parseInt(req.query.imageId);
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    balena.models.device.startService(uuid, imageId).then(function() {
        res.status(200).json({ success: true});
    });

});

app.get('/device/:uuid/stopService', (req, res) => {
    let uuid = req.params.uuid;
    let imageId = parseInt(req.query.imageId);
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    balena.models.device.stopService(uuid, imageId).then(function() {
        res.status(200).json({ success: true});
    });

});

app.get('/device/:uuid/restartService', (req, res) => {
    let uuid = req.params.uuid;
    let imageId = parseInt(req.query.imageId);
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    balena.models.device.restartService(uuid, imageId).then(function() {
        res.status(200).json({ success: true});
    });

});

app.get('/device/:uuid/setCustomLocation', (req, res) => {
    let uuid = req.params.uuid;
    let lng = parseFloat(req.query.lng);
    let lat = parseFloat(req.query.lat);

    let device = { _id: uuid
        , lng: lng
        , lat: lat
    };

    db.devices.update({ _id: uuid }, device, {upsert: true}, function (error, newDoc) {
        if (error) {
            res.status(200).json({ success: false, error: error});
        } else {
            res.status(200).json({ success: true});
        }
    });


});

app.get('/device/:uuid/getCustomLocation', (req, res) => {
    let uuid = req.params.uuid;
    let lng = parseInt(req.query.lng);
    let lat = parseInt(req.query.lat);

    db.devices.findOne({ _id: uuid }, function (error, device) {
        if(device) {
            res.status(200).json({ location: device});
        } else {
            res.status(200).json({ location: {lat: 55.751244, lng: 37.618423}});
        }
    });

});
/////////////////////////////////////////////////////////////////////////////////////////////// DEVICE configVar SECTION
app.get('/device/:uuid/configVar/getAll', (req, res) => {
    let uuid = req.params.uuid;
    balena.models.device.configVar.getAllByDevice(uuid).then(function(vars) {
        res.status(200).json({ configVars: vars});
    });
});

app.get('/device/:uuid/configVar/set', (req, res) => {
    let uuid = req.params.uuid;
    let key = req.query.key;
    let value = req.query.value;
    balena.models.device.configVar.set(uuid, key, value).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/device/:uuid/configVar/get', (req, res) => {
    let uuid = req.params.uuid;
    let key = req.query.key;
    balena.models.device.configVar.get(uuid, key).then(function(value) {
        res.status(200).json({ value: value});
    });
});

app.get('/device/:uuid/configVar/remove', (req, res) => {
    let uuid = req.params.uuid;
    let key = req.query.key;
    balena.models.device.configVar.remove(uuid, key).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/device/:uuid/configVar/change', (req, res) => {
    let uuid = req.params.uuid;
    let key = req.query.key;
    let value = req.query.value;
    balena.models.device.configVar.remove(uuid, key).then(function() {
        balena.models.device.configVar.set(uuid, key, value).then(function() {
            res.status(200).json({ success: true});
        });
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////// DEVICE envVar SECTION
app.get('/device/:uuid/envVar/getAll', (req, res) => {
    let uuid = req.params.uuid;
    balena.models.device.envVar.getAllByDevice(uuid).then(function(vars) {
        res.status(200).json({ envVars: vars});
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////// DEVICE serviceVar SECTION
app.get('/device/:uuid/serviceVar/getAll', (req, res) => {
    let uuid = req.params.uuid;
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    db.devices_vars.find({ deviceId: uuid }, function (err, vars) {
      res.status(200).json({ serviceVars: vars});
    });

    // balena.models.device.serviceVar.getAllByDevice(uuid).then(function(vars) {
    //     res.status(200).json({ serviceVars: vars});
    // });
});

app.get('/device/:uuid/serviceVar/set', (req, res) => {
    let uuid = req.params.uuid;
    let serviceId = req.query.serviceId;
    let key = req.query.key;
    let value = req.query.value;
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    let _id = uuid + '_' + serviceId + '_' + key;
    let device_variable = { _id: _id
      , deviceId: uuid
      , serviceId: serviceId
      , key: key
      , value: value
    };

    db.devices_vars.update({ _id: _id }, device_variable, {upsert: true}, function (error, newDoc) {});

    balena.models.device.serviceVar.set(uuid, serviceId, key, value,).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/device/:uuid/serviceVar/get', (req, res) => {
    let uuid = req.params.uuid;
    let serviceId = req.query.serviceId;
    let key = req.query.key;
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    balena.models.device.serviceVar.get(uuid, serviceId, key).then(function(value) {
        res.status(200).json({ value: value});
    });
});

app.get('/device/:uuid/serviceVar/remove', (req, res) => {
    let uuid = req.params.uuid;
    let serviceId = req.query.serviceId;
    let key = req.query.key;
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    let _id = uuid + '_' + serviceId + '_' + key;
    db.devices_vars.remove({ _id: _id }, {}, function (err, numRemoved) {});


    balena.models.device.serviceVar.remove(uuid, serviceId, key).then(function() {
        res.status(200).json({ success: true});
    });
});

app.get('/device/:uuid/serviceVar/change', (req, res) => {
    let uuid = req.params.uuid;
    let serviceId = req.query.serviceId;
    let key = req.query.key;
    let value = req.query.value;
    balena.models.device.serviceVar.remove(uuid, serviceId, key).then(function() {
        balena.models.device.serviceVar.set(uuid, serviceId, key, value).then(function() {
            res.status(200).json({ success: true});
        });
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////// OS SECTION
app.get('/os/getSupportedVersions', (req, res) => {
    let deviceType = req.query.deviceType;
    balena.models.os.getSupportedVersions(deviceType).then(function(osVersions) {
        res.status(200).json({ osVersions: osVersions});
    });
});

app.get('/os/downloadCheck', async (req, res) => {
  let version = req.query.version;
  let deviceType = req.query.deviceType;
  let os_path = getOsPath(deviceType, version);
  await fs.access(os_path + '-downloading', fs.constants.F_OK, async (err) => {
    if (!err) {
      res.status(200).json({ success: true, status: 'downloading'});
    } else {
      res.status(200).json({ success: true, status: 'downloaded'});
    }
  });
});

app.get('/os/download', async (req, res) => {
    let nameOrId = req.query.nameOrId;
    let version = req.query.version;
    let network = req.query.network;
    let appUpdatePollInterval = req.query.appUpdatePollInterval;
    let wifiKey = req.query.wifiKey;
    let wifiSsid = req.query.wifiSsid;

    let deviceType = req.query.deviceType;

    let os_name = getOsName(deviceType, version);
    let os_path = getOsPath(deviceType, version);

    let sshKeys = [];

    if(pub_ssh_key_for_devices !== '') {
      sshKeys.push(pub_ssh_key_for_devices);
    }
    await db.ssh_keys.find({appName: nameOrId}, (error, ssh_keys) => {
      ssh_keys.forEach(function (elem) {
        sshKeys.push(elem.ssh_key);
      })
    });

    await fs.access(os_path, fs.constants.F_OK, async (err) => {
        if (err) {
          axios({
            method: "get",
            url: `https://api.balena-cloud.com/download?deviceType=${deviceType}&version=${version}`,
            responseType: "stream"
          }).then(function (response) {
            let fileStream = fs.createWriteStream(os_path + '-downloading');
            response.data.pipe(fileStream);
            fileStream.on('finish', function(){
              fs.rename(os_path + '-downloading', os_path, function(err) {
                if ( err ) console.log('ERROR: ' + err);
              });
            });
            res.status(200).json({ success: true, status: 'downloading'});
          }).catch(error => {
            res.status(200).json({ success: false, err: error.message });
          });
        } else {
          const config = await balena.models.os.getConfig(nameOrId, {
            version: version,
            network: network,
            appUpdatePollInterval: appUpdatePollInterval,
            wifiSsid: wifiSsid,
            wifiKey: wifiKey,
          });

          config.os = {
            "sshKeys": sshKeys,
            "udevRules": {
              '33': "ACTION==\"add\", SUBSYSTEM==\"net\", KERNEL==\"wlan1\", ENV{NM_UNMANAGED}=\"1\"\n"
            }
          };

          const splash_path = process.cwd() + '/api/misc/resin-logo.png';
          const config_path = process.cwd() + '/data/'+ nameOrId +'.config.json';
          const config_str = JSON.stringify(config);

          await fs.writeFile(config_path, config_str, async (err, result) => {
            if(err)  {
              res.status(200).json({ success: false, err: err});
            } else {
              await imagefs.write({
                image: os_path,
                partition: 1,
                path: '/config.json',
              }, fs.createReadStream(config_path));

              if (network === 'wifi') {
                const Readable = require('stream').Readable;
                let conf_stream = new Readable;
                conf_stream.push(wifi_config_string(wifiSsid,wifiKey));
                conf_stream.push(null);

                await imagefs.write({
                  image: os_path,
                  partition: 1,
                  path: CONNECTIONS_FOLDER + '/resin-wifi',
                }, conf_stream);
              }

              await imagefs.write({
                image: os_path,
                partition: 1,
                path: SPLASH_FOLDER + '/resin-logo.png',
              }, fs.createReadStream(splash_path));

              return res.status(200).json({ success: true, status: 'configured', os_name: os_name });
            }
          });
        }
    });
});

app.get('/os/download/:os_name/:app_name', (req, res) => {
    let os_name = req.params.os_name;
    let app_name = req.params.app_name;
    let os_path = process.cwd() + '/data/' + os_name;

    res.zip([
      { path: os_path, name: os_name }
    ], app_name + '-' + os_name + '.zip');

});

app.get('/os/getConfig', async (req, res) => {
  let nameOrId = req.query.nameOrId;
  let version = req.query.version;
  let network = req.query.network;
  let appUpdatePollInterval = req.query.appUpdatePollInterval;
  let wifiKey = req.query.wifiKey;
  let wifiSsid = req.query.wifiSsid;
  let sshKeys = [];

  if(pub_ssh_key_for_devices !== '') {
    sshKeys.push(pub_ssh_key_for_devices);
  }
  await db.ssh_keys.find({appName: nameOrId}, (error, ssh_keys) => {
    ssh_keys.forEach(function (elem) {
      sshKeys.push(elem.ssh_key);
    })
  });

  const config = await balena.models.os.getConfig(nameOrId, {
    version: version,
    network: network,
    appUpdatePollInterval: appUpdatePollInterval,
    wifiKey: wifiKey,
    wifiSsid: wifiSsid,
  });

  config.os = {
    "sshKeys": sshKeys,
    "udevRules": {
      '33': "ACTION==\"add\", SUBSYSTEM==\"net\", KERNEL==\"wlan1\", ENV{NM_UNMANAGED}=\"1\"\n"
    }
  };

  let file_path = process.cwd() + '/data/'+ nameOrId +'.config.json';
  let config_str = JSON.stringify(config);
  await fs.writeFile(file_path, config_str, () => {});
  res.send(config_str);
});

app.get('/os/getConfigForDevice', async (req, res) => {
  let nameOrId = req.query.nameOrId;
  let uuid = req.query.uuid;
  let version = req.query.version;
  let network = req.query.network;
  let appUpdatePollInterval = req.query.appUpdatePollInterval;
  let wifiSsid = req.query.wifiSsid;
  let wifiKey = req.query.wifiKey;
  let sshKeys = [];

  if(pub_ssh_key_for_devices !== '') {
    sshKeys.push(pub_ssh_key_for_devices);
  }
  await db.ssh_keys.find({appName: nameOrId}, (error, ssh_keys) => {
    ssh_keys.forEach(function (elem) {
      sshKeys.push(elem.ssh_key);
    })
  });

  const token = await fs.readFileSync(process.cwd() + '/data/token');
  await shell.exec('balena login --token ' + token);

  let cmd_str = 'balena config generate --device ' + uuid + ' --generate-device-api-key --version ' + version +' --appUpdatePollInterval ' + appUpdatePollInterval + ' --network ' + network;
  if( network === 'wifi' ) {
    cmd_str += ' --wifiSsid ' + wifiSsid + ' --wifiKey ' + wifiKey;
  }

  let file_path = process.cwd() + '/data/temp.config.json';
  cmd_str += ' --output ' + file_path;

  await shell.exec(cmd_str);

  const config_string = await fs.readFileSync(file_path);
  let config = JSON.parse(config_string);
  config.os = {
    "sshKeys": sshKeys,
    "udevRules": {
      '33': "ACTION==\"add\", SUBSYSTEM==\"net\", KERNEL==\"wlan1\", ENV{NM_UNMANAGED}=\"1\"\n"
    }
  };

  res.end(JSON.stringify(config));
});
/////////////////////////////////////////////////////////////////////////////////////////////// SSH TUNNEL
app.get('/sshTunnel/:uuid', async (req, res) => {
  let uuid = req.params.uuid;
  if(isNumber(uuid)) {
    uuid = parseInt(uuid);
  }
  const token = await fs.readFileSync(process.cwd() + '/data/token');
  try {
    // const child = shell.exec('balena login --token ' + token + ' && ' + 'balena tunnel ' + uuid + ' -p 22222:22222', {async:true});

    res.status(200).json({ success: true});
  } catch (e) {
    res.status(200).json({ success: false, error: e});
  }

});

/////////////////////////////////////////////////////////////////////////////////////////////// LOGS SECTION
app.get('/logs/history/:uuid', (req, res) => {
    let uuid = req.params.uuid;
    let count = parseInt(req.query.count);
    if(isNumber(uuid)) {
        uuid = parseInt(uuid);
    }

    balena.logs.history(uuid, { count: count }).then(function(lines) {
        res.status(200).json({ lines: lines});
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////// SSH KEYS SECTION
app.get('/ssh_keys/list', (req, res) => {
  db.ssh_keys.find({}, function (error, ssh_keys) {
    res.status(200).json({ ssh_keys: ssh_keys});
  });
});

app.get('/ssh_keys/add', (req, res) => {
  let appName = req.query.appName;
  let name = req.query.name;
  let ssh_key = req.query.ssh_key;

  let ssh_db = { name: name, appName: appName, ssh_key: ssh_key };

  db.ssh_keys.update({ _id: name }, ssh_db, {upsert: true}, function (error, newDoc) {
    if (error) {
      res.status(200).json({ success: false, error: error});
    } else {
      db.ssh_keys.find({}, function (error, ssh_keys) {
        res.status(200).json({ success: true, ssh_keys: ssh_keys});
      });
    }
  });

});

app.get('/ssh_keys/remove', (req, res) => {
  let key_id = req.query.key_id;

  db.ssh_keys.remove({ _id: key_id }, {}, function (error, numRemoved) {
    if (error) {
      res.status(200).json({ success: false, error: error});
    } else {
      db.ssh_keys.find({}, function (error, ssh_keys) {
        res.status(200).json({ success: true, ssh_keys: ssh_keys});
      });
    }
  });
});

export default {
    path: '/api',
    handler: app
}
