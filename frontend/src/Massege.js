import React, { useEffect } from "react";
import "./Massege.css";
import blue_v from "./images/blue_check.png";
import black_v from "./images/black_check.png";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useHistory } from "react-router-dom";
import * as IconSet from "react-icons/fa";

export const Massege = (props) => {
  const history = useHistory();
  const is_show_post = () => {
    if (props.my_user_id === props.post_user_id) return true;
    if (props.post_user_private === false) return true;
    return props.post_user_followers.includes("," + props.my_user_id + ",");
  };
  useEffect(() => {
    console.log(props);
  }, []);

  return (
    <div
      className={
        props.is_recived ? "bubble_chat recived_msg" : "bubble_chat send_msg"
      }
    >
      {props.post_id !== -1 && props.post_id ? (
        <div className="post_massege">
          {props.post_path || props.image_path ? (
            <div
              className="post_massege_user_data"
              onClick={() => {
                const userdata = {
                  user_id: props.post_user_id,
                  is_me: props.post_user_id === props.my_user_id,
                  this_user_id: props.my_user_id,
                };
                history.push({
                  pathname: "/Profile",
                  state: userdata,
                });
              }}
            >
              {props.post_profile_image === "null" ? (
                <IconSet.FaUserCircle className="story_profile_user_image"></IconSet.FaUserCircle>
              ) : (
                <img
                  className="story_profile_user_image"
                  src={`http://${props.ip}:8001/${props.post_profile_image}`}
                  alt="profile"
                ></img>
              )}
              <span>{props.post_user_name}</span>
            </div>
          ) : (
            ""
          )}
          {is_show_post() ? (
            <LazyLoadImage
              onClick={() => {
                if (props.post_path) {
                  history.push({
                    pathname: "/show_post",
                    state: {
                      post_data: { post_id: props.post_id },
                      post_array: [{ post_id: props.post_id }],
                      userdata: { user_id: props.my_user_id },
                    },
                  });
                }
              }}
              className="massege_image"
              src={`http://${props.ip}:8001/${
                props.post_path
                  ? props.post_path
                  : "posts/6_20230829_192959.jpg"
              }`}
              alt="post"
              loading="lazy"
            ></LazyLoadImage>
          ) : (
            <div className="private_post">
              <IconSet.FaLock className="lock_icon"></IconSet.FaLock>
              <span>follow {props.post_user_name} to see their post</span>
            </div>
          )}
        </div>
      ) : (
        ""
      )}
      {props.story_path ? (
        <LazyLoadImage
          className="massege_image"
          src={`http://${props.ip}:8001/${props.story_path}`}
          alt="story"
          loading="lazy"
        ></LazyLoadImage>
      ) : (
        ""
      )}
      <p className="massege">{props.massege}</p>
      <div className="time_and_check">
        <div className="time ">{props.time}</div>
        {!props.is_recived ? (
          <div>
            <img src={props.is_seen ? blue_v : black_v}></img>
            <img src={props.is_seen ? blue_v : black_v}></img>
          </div>
        ) : (
          <div> </div>
        )}
      </div>
    </div>
  );
};
