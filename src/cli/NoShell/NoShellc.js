// NoService/services/NoShellc/entry.js
// Description:
// "NoShellc/entry.js" is a NoService Shell Client.
// Copyright 2018 NOOXY. All Rights Reserved.
//
// beware that this client's crypto uses daemon's implementation so it can only be used as local client instead of remote one.

const readline = require('readline');
const Writable = require('stream').Writable;

DAEMONTYPE = 'WebSocket';
DAEMONIP = '0.0.0.0';

const NSc = new (require('./NSc'))(DAEMONIP, DAEMONTYPE);


// async stdio
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted){
    rl.output.write("\x1B[2K\x1B[200D"+rl.query+"["+((rl.line.length%2==1)?"*.":".*")+"]");
  }
  else
    rl.output.write(stringToWrite);
};


  let _username = null;
  let _password = null;
  let _token = null;
  let _mutex = true;
  let commandread;
  let wait_auth;
  let _as;




  // get username and password from terminal input
  let _get_username_and_password = (callback) => {
    let u = null;
    let p = null;
    rl.stdoutMuted = false;
    rl.query = 'username: ';
    rl.question(rl.query, (username) => {

      u = username;
      _get_password((err, p)=>{
        callback(false, u, p);
      });
    });

  };

  let _get_password = (callback)=> {
    rl.stdoutMuted = true;
    rl.query = 'password: ';
    rl.question(rl.query, (password) => {
      rl.stdoutMuted = false;
      console.log('');
      rl.history.shift();
      p = password;
      _password = password;
      callback(false, p);
    });
  }

  NSc.getImplementaionModule((err, Implementation)=>{
    // setup NoService Auth implementation
    let signin = (connprofile, data, data_sender)=>{
      console.log('Please signin your account.');
      _get_password((err, p)=>{
        let _data = {
          u: _username,
          p: p
        }
        _username = _data.u;
        Implementation.emitRouter(connprofile, 'GT', _data);
        setTimeout(()=> {
          _as.call('welcome', null, (err, msg) => {
            console.log(msg);
            commandread();
          });
        }, 100)
      });
    }
    Implementation.setImplement('signin', signin);

    // setup NoService Auth implementation
    Implementation.setImplement('AuthbyToken', (connprofile, data, data_sender) => {
      let callback = (err, token)=>{
        let _data = {
          m:'TK',
          d:{
            t: data.d.t,
            v: token
          }
        }
        data_sender(connprofile, 'AU', 'rs', _data);
      };
      if(_token == null) {
        signin(connprofile, data, data_sender);
      }
      else {
        callback(false, _token);
      }

    });

    Implementation.setImplement('onToken', (err, token)=>{
      wait_auth = false;
      _token = token;
    });

    Implementation.setImplement('AuthbyTokenFailed', (connprofile, data, data_sender) => {
      wait_auth = true;
      signin(connprofile, data, data_sender);
    });

    // setup NoService Auth implementation
    Implementation.setImplement('AuthbyPassword', (connprofile, data, data_sender) => {
      let callback = (err, password)=>{
        let _data = {
          m:'PW',
          d:{
            t: data.d.t,
            v: password
          }
        }
        data_sender(connprofile, 'AU', 'rs', _data);
      };
      callback(err, _password);
    });

      console.log('connecting to default server of daemon(nsp('+DAEMONTYPE+')://'+DAEMONIP+')...');
      // console.log('To access '+_daemon_display_name+'. You need to auth yourself.');
      // Implementation.returnImplement('signin')(DAEMONTYPE, DAEMONIP, DAEMONPORT, (err, token)=>{
      //   if(err) {
      //     console.log('Auth failed.');
      //   }
      //   _token = token;
      let _new_session = ()=> {
        rl.question('Login as: ', (uname)=> {
          console.log('You are now "'+uname+'". Type "exit" to end this session.');
          _username = uname;
          NSc.setUsername(uname);
          NSc.createActivitySocket('NoShell', (err, as)=>{
            _as = as;
            commandread = () => {
              rl.question('>>> ', (cmd)=> {
                if (cmd == 'exit') {
                  _username = null;
                  _token = null;
                  _as = null;
                  _new_session();
                  return 0; //closing RL and returning from function.
                }
                as.call('sendC', {c: cmd}, (err, json)=>{
                  console.log(json.r);
                  if(!wait_auth)
                    commandread(); //Calling this function again to ask new question
                });
              });
            };

            console.log('connected.');
            as.onData=(data) => {
              if(data.t == 'stream') {
                console.log(data.d);
              }
            };
            as.call('welcome', null, (err, msg) => {
              console.log(msg);
              commandread();
            });
          });
        });
      };

      _new_session();
    });
