import React, { useEffect, useRef, useState } from "react";
import "./NewPost.css";
import axios from "axios";
import * as IconSet from "react-icons/fa";
import { useHistory } from "react-router-dom";

const NewPost = (props) => {
  const history = useHistory();

  const image_input_ref = useRef(null);
  const [image, set_image] = useState();
  const [short_dis, set_short_dis] = useState("");

  function handleselect() {
    image_input_ref.current.click();
  }
  function handlechange(file_name) {
    const formdata = new FormData();
    formdata.append("post", file_name);
    formdata.append("user_id", props.userdata.user_id);

    axios
      .post(`http://${props.ip}:8001/upload_new_post`, formdata)
      .then((response) => {
        if (response.status === 200) {
          console.log("set image sucsess");
          set_image(response.data);
        }
      })
      .catch((err) => console.log(err));
  }
  function handlePost() {
    if (image) {
      axios
        .post(`http://${props.ip}:8001/set_new_post`, { image, short_dis })
        .then((response) => {
          if (response.status === 200) {
            console.log("set post sucsess");

            history.push({
              pathname: "/Profile",
              state: props.userdata,
            });
          }
        })
        .catch((err) => console.log(err));
    }
  }

  return (
    <div className="new_post_page">
      <div
        className="new_post_container"
        onClick={() => {
          handleselect();
        }}
      >
        {image ? (
          <img
            className="new_post__image"
            src={`http://${props.ip}:8001/${image}`}
            alt="new_post"
          ></img>
        ) : (
          <IconSet.FaPlusCircle className="add_new_post_icon"></IconSet.FaPlusCircle>
        )}
        <input
          type="file"
          ref={image_input_ref}
          onChange={(e) => handlechange(e.target.files[0])}
          style={{ display: "none" }}
          required
        ></input>
      </div>
      <input
        maxLength={50}
        type="text"
        placeholder="write something..."
        className="post_short_dis"
        onChange={(e) => set_short_dis(e.target.value)}
      ></input>
      <button
        className="post_button"
        onClick={() => {
          handlePost();
        }}
      >
        Post
      </button>
    </div>
  );
};

export default NewPost;
