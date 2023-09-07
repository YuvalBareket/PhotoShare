import React, { useEffect, useRef, useState } from "react";
import "./Stories.css";
import Story from "./Story";
import axios from "axios";

import * as IconSet from "react-icons/fa";

const Stories = (props) => {
  const image_input_ref = useRef(null);
  const [my_stories, set_my_stories] = useState([]);
  const [my_user_story_seen_by, set_my_user_story_seen_by] = useState("empty");

  props.socket.on(`user_${props.userdata.user_id}_watched`, (post_user) => {
    if (post_user === props.userdata.user_id)
      set_my_user_story_seen_by(my_user_story_seen_by + post_user + ",");
    else {
      let new_array = my_stories;

      let story_index = my_stories.findIndex(
        (item) => item.user_id === post_user
      );
      if (story_index !== -1) {
        console.log(story_index);
        new_array[story_index].seen_by =
          new_array[story_index].seen_by + props.userdata.user_id + ",";
        console.log(new_array[story_index].seen_by);
        set_my_stories(new_array);
      }
    }
  });
  useEffect(() => {
    axios
      .post(`http://${props.ip}:8001/get_all_stories`, {
        user_id: props.userdata.user_id,
        my_user_id: props.userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_my_stories(response.data);
          console.log(response.data);
          let my_story_index = response.data.findIndex(
            (item) => item.user_id === props.userdata.user_id
          );
          if (my_story_index !== -1) {
            set_my_user_story_seen_by(response.data[my_story_index].seen_by);
          }
        }
      })
      .catch((err) => console.log(err));
  }, []);
  function handleselect() {
    image_input_ref.current.click();
  }

  function handlechange(file_name) {
    const formdata = new FormData();
    formdata.append("story", file_name);
    formdata.append("user_id", props.userdata.user_id);

    axios
      .post(`http://${props.ip}:8001/upload_story_image`, formdata)
      .then((response) => {
        if (response.status === 200) {
          console.log("upload image sucsess");
          set_my_user_story_seen_by(",");
        }
      })
      .catch((err) => console.log(err));
  }
  return (
    <div className="stories_container">
      <div className="add_story">
        <div className="story_cover">
          <IconSet.FaPlus
            className="add_icon"
            onClick={handleselect}
          ></IconSet.FaPlus>
        </div>
        <Story
          show_story={props.show_story}
          profile_image={props.userdata.profile_image}
          ip={props.ip}
          user_id={props.userdata.user_id}
          my_user_id={props.userdata.user_id}
          is_seen={
            my_user_story_seen_by === "empty" ||
            my_user_story_seen_by.includes("," + props.userdata.user_id + ",")
          }
        ></Story>{" "}
      </div>
      <div className="stories">
        {my_stories.map((item) => {
          if (item.user_id !== props.userdata.user_id)
            return (
              <Story
                key={item.user_id}
                show_story={props.show_story}
                profile_image={item.profile_image}
                user_id={item.user_id}
                my_user_id={props.userdata.user_id}
                ip={props.ip}
                is_seen={item.seen_by.includes(
                  "," + props.userdata.user_id + ","
                )}
              ></Story>
            );
        })}
      </div>
      <input
        type="file"
        ref={image_input_ref}
        onChange={(e) => handlechange(e.target.files[0])}
        style={{ display: "none" }}
      ></input>
    </div>
  );
};

export default Stories;
