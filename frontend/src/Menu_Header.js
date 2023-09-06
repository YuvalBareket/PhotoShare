import React from "react";
import * as IconSet from "react-icons/fa";

import "./Menu_Header.css";
const Menu_Header = (props) => {
  return (
    <div className="menu_header">
      <div className="name_and_image">
        <h2> {props.userdata.user_name}</h2>
        <div className="menu_user_image">
          {props.userdata.profile_image === "null" ? (
            <IconSet.FaUserCircle className="menu_user_image"></IconSet.FaUserCircle>
          ) : (
            <img
              onClick={() => props.large_image(props.userdata.profile_image)}
              className="menu_user_image"
              src={`http://${props.ip}:8001/${props.userdata.profile_image}`}
              alt="profile"
            ></img>
          )}{" "}
        </div>
      </div>
    </div>
  );
};

export default Menu_Header;
