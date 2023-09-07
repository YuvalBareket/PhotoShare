import React from "react";
import "./Suggest.css";
import * as IconSet from "react-icons/fa";
import { useHistory } from "react-router-dom";

const Suggest = (props) => {
  const history = useHistory();

  return (
    <div className="card">
      <div
        className="suggest_data"
        onClick={() => {
          const userdata = {
            user_id: props.user_id,
            is_me: props.user_id === props.my_user_id,
            this_user_id: props.my_user_id,
          };
          console.log(userdata);
          history.push({
            pathname: "/Profile",
            state: userdata,
          });
        }}
      >
        <div className="suggest_image">
          {props.profile_image === "null" ? (
            <IconSet.FaUserCircle className="suggest_image"></IconSet.FaUserCircle>
          ) : (
            <img
              className="suggest_image"
              src={`http://${props.ip}:8001/${props.profile_image}`}
              alt="profile"
            ></img>
          )}
        </div>
        <div className="suggest_name">{props.name}</div>
      </div>
      <button
        className="follow"
        onClick={() => {
          props.follow(props.user_id, props.is_private);
        }}
      >
        Follow
      </button>
    </div>
  );
};

export default Suggest;
