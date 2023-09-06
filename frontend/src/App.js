import React, { Component, useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import io from "socket.io-client";
import Sign_in from "./Sign_in";
import Home from "./Home";
import Masseges from "./Masseges";
import Notifications from "./Notifications";
import Search from "./Search";
import Login from "./Login";
import Get_IP from "./Get.IP.json";
import PhotoShare from "./PhotoShare";
import Profile from "./Profile";
import Edit_Profile from "./Edit_Profile";
import Follow_Request from "./Follow_Request";
import Chat from "./Chat";
import Show_Post from "./Show_Post";
import Stoker_Alerts from "./Stoker_Alerts";
const socket = io.connect(`http://${Get_IP.ipAddress}:8001`);
function App() {
  return (
    <Router>
      <div className="app_page">
        <Switch>
          <Route exact path="/">
            <Login socket={socket} ip={Get_IP.ipAddress}></Login>
          </Route>

          <Route exact path="/sign_in">
            <Sign_in ip={Get_IP.ipAddress}></Sign_in>
          </Route>

          <Route exact path="/Tweets">
            <PhotoShare ip={Get_IP.ipAddress} socket={socket}></PhotoShare>
          </Route>

          <Route exact path="/Profile">
            <Profile ip={Get_IP.ipAddress} socket={socket}></Profile>
          </Route>
          <Route exact path="/Edit_Profile">
            <Edit_Profile ip={Get_IP.ipAddress}></Edit_Profile>
          </Route>
          <Route exact path="/Follow_requests">
            <Follow_Request ip={Get_IP.ipAddress}></Follow_Request>
          </Route>
          <Route exact path="/Chat">
            <Chat ip={Get_IP.ipAddress} socket={socket}></Chat>
          </Route>
          <Route exact path="/show_post">
            <Show_Post ip={Get_IP.ipAddress} socket={socket}></Show_Post>
          </Route>
          <Route exact path="/Stoker_Alerts">
            <Stoker_Alerts
              ip={Get_IP.ipAddress}
              socket={socket}
            ></Stoker_Alerts>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
