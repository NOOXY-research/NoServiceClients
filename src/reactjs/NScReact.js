// NScReact.js
// Description:
// "NScReact.js" NOOXY Service client Reactjs components.
// Copyright 2018 NOOXY. All Rights Reserved.

import React, { Component } from 'react';
import './NScReact.css';

const getQueryVariable = (variable)=>
{
       let query = window.location.search.substring(1);
       let vars = query.split("&");
       for (let i=0;i<vars.length;i++) {
               let pair = vars[i].split("=");
               if(pair[0] === variable){return pair[1];}
       }
       return(false);
}

const setCookie = (cname, cvalue, exdays)=> {
  let d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export class SigninPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: null,
      username: null,
      status: "In order to access this service. You must signin into your account."
    };
    this.onFinish = props.onFinish;
  }

  updatePasswordInputValue(evt) {
    this.setState({
      password: evt.target.value
    });
  }

  updateUsernameInputValue(evt) {
    this.setState({
      username: evt.target.value
    });
  }

  componentDidMount(){
    this.username.focus();
  }

  render() {
    return(
      <div className="Page">
        <div className="Page-Block">
          <div className="Page-Row">
            <div className="Page-Row-Text">
              <h1>{"Signing in"}</h1>
              <p> {this.state.status}</p>
            </div>
          </div>
        </div>

        <div className="Page-Block">
          <div className="Page-Row">
            <div className="Page-Row-Text">
              <h2>{"Username"}</h2>
              <input ref={(input) => { this.username = input; }}  onChange={evt => this.updateUsernameInputValue(evt)} placeholder="Enter your NOOXY username" className="ChPage-Sender-Input"></input>
            </div>
          </div>
          <div className="Page-Row">
            <div className="Page-Row-Text">
              <h2>{"Password"}</h2>
              <input type="password" onChange={evt => this.updatePasswordInputValue(evt)} placeholder="Enter your NOOXY password" className="ChPage-Sender-Input"></input>
            </div>
          </div>
        </div>

        <div className="Page-Block">
          <div className="Page-Row"  onClick={()=>{
            try{
              this.props.NSc.getImplement((err, implement_module)=>{
                implement_module.getDefaultClientConnProfile((err, connprofile) => {
                  let _data = {
                    u: this.state.username,
                    p: this.state.password
                  }
                  implement_module.returnImplement('setUser')(false, _data.u);
                  implement_module.setImplement('onToken', (err, token)=>{
                    if(token) {
                      setCookie('NSToken', token, 7);
                      window.location.replace('/');
                      setTimeout(()=>{window.location.reload();}, 500);
                    }
                    else {
                      this.setState({status:'Wrong username or password!'});
                    }
                  });
                  implement_module.emitRouter(connprofile, 'GT', _data);

                });
              });
            }
            catch(e) {
              console.log(e);
            }

          }}>
            <div className="Page-Row-Text">
              <h2>{"Done"}</h2>
              <p> {"sign me in"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export class PasswordPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: null
    }
  }

  updatePasswordInputValue(evt) {
    this.setState({
      password: evt.target.value
    });
  }

  componentDidMount(){
    this.password.focus();
  }

  render() {
    return(
      <div className="Page">
        <div className="Page-Block">
          <div className="Page-Row">
            <div className="Page-Row-Text">
              <h1>{"Enter your Password"}</h1>
              <p> {"In order to access this service. You must enter your password of your account."}</p>
            </div>
          </div>
        </div>

        <div className="Page-Block">
          <div className="Page-Row">
            <div className="Page-Row-Text">
              <h2>{"Username"}</h2>
              <p>{this.props.NSc.returnUserName()?this.props.NSc.returnUserName():'null'}</p>
            </div>
          </div>
          <div className="Page-Row">
            <div className="Page-Row-Text">
              <h2>{"Password"}</h2>
              <input ref={(input) => { this.password = input; }} type="password" onChange={evt => this.updatePasswordInputValue(evt)} placeholder="Enter your NOOXY password" className="ChPage-Sender-Input"></input>
            </div>
          </div>
        </div>

        <div className="Page-Block">
          <div className="Page-Row"  onClick={()=>{
            this.props.NSc.getImplement((err, implement_module)=>{
            implement_module.getDefaultClientConnProfile((err, connprofile) => {
              let _data = {
                m: 'PW',
                d: {
                  t: getQueryVariable('authtoken'),
                  v: this.state.password
                }
              }
              implement_module.sendRouterData(connprofile, 'AU', 'rs', _data);
              setTimeout(this.props.onFinish, 500);
            });
          });

          }}>
            <div className="Page-Row-Text">
              <h2>{"Done"}</h2>
              <p> {"This is my password."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
