const fs = require('fs')
const express = require('express');
const https = require('https')
const http = require('http')
const bodyParser = require('body-parser')
var app = express();
const path = require('path')
const CONTEXT_INSECURE = process.env.NODE_ENV == 'development'

app.use('/', express.static(path.join(__dirname, 'public')));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.post('/login', function (req, res) {
  const recreate = { "username": req.body.username, "password": req.body.password, "role": req.body.role, "domain": req.body.domain  }
  const data = JSON.stringify(recreate)
  const options = {
    hostname: '127.0.0.1',
    port: 10443,
    path: `/api/v1/login/${recreate.role}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    rejectUnauthorized: !CONTEXT_INSECURE
  }
  const login = https.request(options, response => {
    console.log(`statusCode: ${response.statusCode}`)
  
    response.on('data', d => {
      const toSend = d.toString('utf8')
      console.log('received authorization',toSend)
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Powered-By', 'bearer');
      res.cookie('demochat-token', toSend, {
        maxAge: 60000, // Lifetime
      })
      res.redirect(302, '/')//send(toSend)
      res.end()
    })
  })
  
  login.on('error', error => {
    res.send('LOGIN ERROR:', error)
  })
  
  login.write(data)
  login.end()//redirect(302, '/')
  console.log('login request',recreate)
})

const server = http.createServer(app)

const sserver = https.createServer({
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
  passphrase: 'simplephrase'
}, app);

var io = require('socket.io')(CONTEXT_INSECURE ? server : sserver);
var iomiddleware = require('socketio-wildcard')();

io.use(iomiddleware);
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('*', (msg) => {
      // console.log('COPY message: ' + JSON.stringify(msg));
    })
    socket.on('/ping', (msg) => {
      // console.log('message: ' + msg.value);
      
      const data = msg
      const resolve = data.token == 'no_token' ? () => io.emit('ping', '{ message: "not authorized" }') : () => {
        const options = {
          entrypoint: '/api/v1/ping',
          METHOD: 'GET',
          path: '/api/v1/ping?msg='+encodeURI(msg.value),
          params: '?msg='+encodeURI(msg.value),
          token: data.token
        }
        apiClient(options, (x) => io.emit('ping', x))
      }
      resolve()
    });
    socket.on('/get/rooms', (msg) => {
      // console.log('message: ' + msg.value);
      
      const data = msg
      const resolve = data.token == 'no_token' ? () => io.emit('ping', '{ message: "not authorized" }') : () => {
        const options = {
          hostname: '127.0.0.1',
          port: 10443,
          path: `/api/v1/user/get/rooms`,
          METHOD: 'POST',
          token: data.token,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          },
          rejectUnauthorized: !CONTEXT_INSECURE,
          data: JSON.stringify(data)
        }
        apiClient(options, (x) => {
          io.emit('#rooms', x)
        })
      }
      resolve()
    });    
    socket.on('/get/messages', (msg) => {
      // console.log('/get/messages: ' + JSON.stringify(msg));
      
      const data = msg
      const resolve = id => !data || !data.token || data.token == 'no_token' ? () => io.emit('ping', '{ message: "not authorized" }') : () => {
        const options = {
          hostname: '127.0.0.1',
          port: 10443,
          path: `/api/v1/room/`+[id,'get',10].join('/'),
          METHOD: 'GET',
          token: data.token,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          },
          rejectUnauthorized: !CONTEXT_INSECURE,
          data: JSON.stringify(data)
        }
        apiClient(options, (x) => {
          io.emit('#messages', x)
        })
      }
      data.rooms.map( x => resolve(x)() )
    });
    socket.on('/send/message', (msg) => {
      const data = msg
      const resolve = id => !data || !data.token || data.token == 'no_token' ? () => io.emit('ping', '{ message: "not authorized" }') : () => {
        const options = {
          hostname: '127.0.0.1',
          port: 10443,
          path: `/api/v1/room/`+[id,'send'].join('/'),
          METHOD: 'POST',
          token: data.token,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          },
          rejectUnauthorized: !CONTEXT_INSECURE,
          data: JSON.stringify(data)
        }
        apiClient(options, (x) => {
          io.emit('#messages', x)
        })
      }
      resolve(data.room)()
    });
});


server.listen(3000, () => {
  console.log('insecure server listening on *:3000');
});

sserver.listen(3443, () => {
  console.log('secure server listening on *:3443');
});

const apiClient = (params, cb) => {
  // console.log('token to use in API', params.token)
  // console.log('rejectUnauthorized:', !CONTEXT_INSECURE)
  const data = params.data ? params.data : '{ "message": "default message" }'
  const options = {
    hostname: '127.0.0.1',
    port: 10443,
    path: params.path,
    method: params.METHOD,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `${params.token}`,
      // 'Accept': 'application/json'
    },
    rejectUnauthorized: !CONTEXT_INSECURE,
    requestCert: true,
    agent: false
  }
  const apiRequest = https.request(options, response => {
    // console.log(`statusCode: ${response.statusCode}`)
    response.on('data', d => {
      const toSend = d.toString('utf8')
      cb(JSON.parse(toSend))
    })
  })

  apiRequest.on('error', error => {
    console.log('LOGIN ERROR:', error)
  })

  apiRequest.write(data)
  apiRequest.end()
}