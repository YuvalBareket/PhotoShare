import React, { useEffect, useRef, useState } from "react";
import "./Stories.css";
import * as IconSet from "react-icons/fa";
import axios from "axios";

const Story = (props) => {
  const [my_stories, set_my_stories] = useState([]);

  const [is_seen, set_is_seen] = useState(true);
  const [first_unseen_story, set_first_unseen_story] = useState(0);

  useEffect(() => {
    set_is_seen(props.is_seen);
  }, [is_seen, props.is_seen]);
  return (
    <div
      className="story_container"
      onClick={() => {
        axios
          .post(`http://${props.ip}:8001/get_my_stories`, {
            user_id: props.user_id,
            my_user_id: props.my_user_id,
          })
          .then((response) => {
            if (response.status === 200) {
              set_my_stories(response.data);
              const unseen = response.data.findIndex(
                (item) => !item.seen_by.includes("," + props.my_user_id + ",")
              );
              console.log(response.data, unseen);

              if (unseen !== -1) {
                set_first_unseen_story(unseen);
                set_is_seen(false);
                props.show_story(response.data, unseen);
              } else props.show_story(response.data, 0);
            }
          })
          .catch((err) => console.log(err));
      }}
    >
      {props.profile_image === "null" ? (
        <IconSet.FaUserCircle className="story_image"></IconSet.FaUserCircle>
      ) : (
        <img
          className={is_seen ? "story_image is_seen" : "story_image isnt_seen"}
          src={`http://${props.ip}:8001/${props.profile_image}`}
          alt="profile"
        ></img>
      )}{" "}
    </div>
  );
};

export default Story;
