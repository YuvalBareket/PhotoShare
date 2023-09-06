import React, { useEffect, useState } from "react";
import "./Footer.css";
import axios from "axios";

import * as IconSet from "react-icons/fa";
import { useHistory } from "react-router-dom";

const Footer = (props) => {
  function handleClick(page_name) {
    props.callback(page_name);
  }

  return (
    <div className="footer_container">
      <div className="icon_cover" onClick={() => handleClick("Home")}>
        <IconSet.FaHome
          className={
            props.icon === "Home" || props.icon === "Profile"
              ? "icon selected_icon"
              : "icon"
          }
        ></IconSet.FaHome>
      </div>
      <div className="icon_cover" onClick={() => handleClick("Masseges")}>
        <div
          className={
            props.masseges === 0 || props.icon === "Masseges"
              ? "no_alert"
              : "alert_number"
          }
        >
          {props.masseges}
        </div>

        <IconSet.FaEnvelope
          className={props.icon === "Masseges" ? "icon selected_icon" : "icon"}
        ></IconSet.FaEnvelope>
      </div>
      <div className="icon_cover" onClick={() => handleClick("NewPost")}>
        <IconSet.FaPlusSquare
          className={props.icon === "NewPost" ? "icon selected_icon" : "icon"}
        ></IconSet.FaPlusSquare>
      </div>
      <div className="icon_cover" onClick={() => handleClick("Search")}>
        <IconSet.FaSearch
          className={props.icon === "Search" ? "icon selected_icon" : "icon"}
        ></IconSet.FaSearch>
      </div>
      <div className="icon_cover" onClick={() => handleClick("Notifications")}>
        <div
          className={
            props.notifications === 0 || props.icon === "Notifications"
              ? "no_alert"
              : "alert_number"
          }
        >
          {props.notifications}
        </div>

        <IconSet.FaBell
          className={
            props.icon === "Notifications" ? "icon selected_icon" : "icon"
          }
        ></IconSet.FaBell>
      </div>
    </div>
  );
};

export default Footer;
