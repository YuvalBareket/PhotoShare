import React, { useEffect, useRef, useState } from "react";
import "./Edit_Profile.css";
import { useLocation } from "react-router-dom";
import * as IconSet from "react-icons/fa";
import { useHistory } from "react-router-dom";

import axios from "axios";
const Edit_Profile = (props) => {
  const image_input_ref = useRef(null);
  const location = useLocation();
  const userdata = location.state;
  const [image, set_image] = useState(userdata.profile_image);
  const [user_name, set_user_name] = useState(userdata.user_name);
  const history = useHistory();

  axios.post(`http://${props.ip}:8001/set_is_connected`, {
    user_id: userdata.user_id,
    is_connected: true,
  });

  function handlechange(file_name) {
    const formdata = new FormData();
    formdata.append("profile", file_name);
    formdata.append("user_id", userdata.user_id);

    axios
      .post(`http://${props.ip}:8001/upload_profile_image`, formdata)
      .then((response) => {
        if (response.status === 200) {
          console.log("set image sucsess");
          set_image(response.data);
        }
      })
      .catch((err) => console.log(err));
  }
  function handleselect() {
    image_input_ref.current.click();
  }
  function handleclick() {
    axios
      .post(`http://${props.ip}:8001/set_user_name`, {
        user_id: userdata.user_id,
        user_name: user_name,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          alert(response.data);
        }
      })
      .catch((err) => console.log(err));
  }
  return (
    <div className="edit_page">
      <IconSet.FaArrowAltCircleLeft
        className="profile_back_arrow"
        onClick={() => {
          const userdata_object = {
            user_id: userdata.user_id,
            is_me: true,
            this_user_id: userdata.user_id,
          };
          history.push({
            pathname: "/Profile",
            state: userdata_object,
          });
        }}
      ></IconSet.FaArrowAltCircleLeft>
      <h1>Edit profile</h1>
      <div className="edit_profile_image_container" onClick={handleselect}>
        {image === "null" ? (
          <IconSet.FaUserCircle className="edit_profile_image"></IconSet.FaUserCircle>
        ) : (
          <img
            className="edit_profile_image"
            src={`http://${props.ip}:8001/${image}`}
            alt="profile"
          ></img>
        )}
      </div>
      <input
        type="file"
        ref={image_input_ref}
        onChange={(e) => handlechange(e.target.files[0])}
        style={{ display: "none" }}
      ></input>
      <div className="change_data">
        <input
          type="text"
          value={user_name}
          onChange={(e) => {
            set_user_name(e.target.value);
          }}
        ></input>
        <button onClick={handleclick}>change user name</button>
      </div>
    </div>
  );
};

export default Edit_Profile;
