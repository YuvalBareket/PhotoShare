import React from "react";
import "./Header.css";
import * as IconSet from "react-icons/fa";

import logo from "./images/Logo_of_Twitter.svg.png";
const Header = (props) => {
  return (
    <div className="header_container">
      <div className="all_logo">
        <IconSet.FaCamera className="logo"></IconSet.FaCamera>
        <div>
          <h1 className="name">
            {" "}
            <div>P</div>hoto<div>S</div>hare
          </h1>
        </div>
      </div>
      <div
        className="user_image"
        onClick={() => {
          props.callback();
        }}
      >
        {props.userdata.profile_image === "null" ? (
          <IconSet.FaUserCircle className="user_image"></IconSet.FaUserCircle>
        ) : (
          <img
            className="user_image"
            src={`http://${props.ip}:8001/${props.userdata.profile_image}`}
            alt="profile"
          ></img>
        )}
      </div>
    </div>
  );
};

export default Header;
