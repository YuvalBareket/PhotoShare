import React, { useState } from "react";
import "./Menu_Main.css";
import * as IconSet from "react-icons/fa";
import { useHistory } from "react-router-dom";
import axios from "axios";

const Menu_Main = (props) => {
  const history = useHistory();
  const [is_delete_profile, set_is_delete_profile] = useState(false);
  function handle_delete_profile() {
    axios
      .post(`http://${props.ip}:8001/delete_user`, {
        userdata: props.userdata,
      })
      .then((response) => {
        if (response.status === 200) {
          history.push({
            pathname: "/",
          });
        }
      })
      .catch((err) => console.log(err));
  }
  return (
    <div className="menu_main">
      <div
        className="profile"
        onClick={() => {
          history.push({
            pathname: "/Profile",
            state: props.userdata,
          });
        }}
      >
        <span> profile </span>
        <IconSet.FaUser></IconSet.FaUser>
      </div>
      <div className="menu_main_footer">
        <span
          onClick={() => {
            history.push({
              pathname: "/",
            });
          }}
        >
          Log out
        </span>
        <div
          onClick={() => {
            set_is_delete_profile(true);
          }}
        >
          <span>Delete profile</span>
          <IconSet.FaTrash></IconSet.FaTrash>
        </div>
      </div>
      {is_delete_profile ? (
        <div className="delete_profile">
          <div className="delete_profile_massege">
            <span>are you sure you want to delete your profile?</span>
            <div>
              <button
                onClick={() => {
                  handle_delete_profile();
                }}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  set_is_delete_profile(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Menu_Main;
