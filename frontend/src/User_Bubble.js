import React, { useState } from "react";
import "./Send_Post.css";
import * as IconSet from "react-icons/fa";

const User_Bubble = (props) => {
  const [is_selected, set_is_selected] = useState(false);
  return (
    <div
      className="user_bubble"
      onClick={() => {
        props.select_user(props.user_id, props.room);
        set_is_selected(!is_selected);
      }}
    >
      <div className={is_selected ? "user_select" : "user_unseleced"}>
        {props.profile_image === "null" ? (
          <IconSet.FaUserCircle className="send_post_user_image"></IconSet.FaUserCircle>
        ) : (
          <img
            className="send_post_user_image"
            src={`http://${props.ip}:8001/${props.profile_image}`}
            alt="profile"
          ></img>
        )}{" "}
      </div>
      {props.user_name}
    </div>
  );
};

export default User_Bubble;
