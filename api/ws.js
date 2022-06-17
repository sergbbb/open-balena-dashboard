const app = require('express')()
const socket = require('socket.io')
const fs = require('fs');
const shell = require('shelljs');
// const { spawn } = require('child_process')
let server = null
let io = null

const startPort = 22222
let usedPorts = []
let sessions = {}
let sessionToPort = {}

const getAvailablePort = () => {
  let availablePort = startPort
  do {
    availablePort += 1
  } while (usedPorts.includes(availablePort))
  usedPorts.push(availablePort)
  return availablePort
}

app.all('/init', (req, res) => {
  if (!server) {
    server = res.connection.server
    io = socket(server)

    io.on('connection', function (socket) {

      socket.on('startSSH', async (data) => {
        const uuid = data.uuid
        const cid = data.cid
        const port = getAvailablePort()
        sessionToPort[uuid] = port

        const token = await fs.readFileSync(process.cwd() + '/data/token');
        shell.exec('balena login --token ' + token, {silent:true})
        sessions[uuid] = shell.exec('balena tunnel ' + uuid + ' -p 22222:' + port, {async:true, silent:true})
        sessions[uuid].stdout.on('data', function(stdout) {
          socket.emit('msg', `${stdout}`, {uuid:uuid, cid: cid})
        });

        sessions[uuid].on('close', (code) => {
          socket.emit('msg', `Tunnel was closed! Code: ${code}`)
          try {
            usedPorts.splice( usedPorts.indexOf(port) , 1)
            delete sessions[uuid]
          } catch (e) { }
        });
      })

      socket.on('stopSSH', async (data) => {
        const uuid = data.uuid
        if (sessions.hasOwnProperty(uuid)) {
          // const port = sessionToPort[uuid]
          // usedPorts.splice( usedPorts.indexOf(port) , 1)
          // delete sessions[uuid]
          // sessions[uuid].kill('SIGINT')
          socket.emit('msg', `Tunnel was closed!`)
        } else {
          socket.emit('msg', `There is no session with such uuid`)
        }
      })

      socket.on('msg', msg => {
        console.log('Recived: ' + msg)

        setTimeout(() => {
          socket.emit('msg', `Response to: ${msg}`)
        }, 1000)
      })

      socket.on('disconnect', () => console.log('disconnected'))
    })
  }

  res.json({ msg: 'server is set' })
})

module.exports = app
