import React from "react";
import "./Alert.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import * as IconSet from "react-icons/fa";
import { useHistory } from "react-router-dom";

const Alert = (props) => {
  const history = useHistory();
  return (
    <div
      className={
        props.alert_data.is_seen === 0 ? "all_alert color_alert" : "all_alert"
      }
    >
      <div
        className="alert"
        onClick={() => {
          if (props.alert_data.post_id) {
            console.log(props.alert_data.post_id);
            history.push({
              pathname: "/show_post",
              state: {
                comment_id: props.alert_data.comment_id,
                post_data: { post_id: props.alert_data.post_id },
                userdata: props.userdata,
                post_array: [{ post_id: props.alert_data.post_id }],
              },
            });
          }
        }}
      >
        <div className="alert_user">
          {props.alert_data.profile_image === "null" ? (
            <IconSet.FaUserCircle className="profile_image"></IconSet.FaUserCircle>
          ) : (
            <img
              onClick={() => props.large_image(props.alert_data.profile_image)}
              className="profile_image"
              src={`http://${props.ip}:8001/${props.alert_data.profile_image}`}
              alt="profile"
            ></img>
          )}{" "}
        </div>
        <div className="alert_main">
          <span
            className="alert_user_name"
            onClick={(event) => {
              event.stopPropagation();
              const userdata = {
                user_id: props.alert_data.alert_user_id,
                is_me:
                  props.alert_data.alert_user_id ===
                  props.alert_data.recived_user,
                this_user_id: props.alert_data.recived_user,
              };
              history.push({
                pathname: "/Profile",
                state: userdata,
              });
            }}
          >
            {props.alert_data.user_name}
          </span>
          {props.alert_data.comment_id === -1 ? (
            ""
          ) : (
            <span className="alert_font">{props.alert_data.alert}</span>
          )}
          <div className="comment_div">{props.alert_data.comment}</div>
        </div>
        <div className="alert_post">
          {props.alert_data.post_id ? (
            <div className="alert_post_image_container ">
              <LazyLoadImage
                className="alert_post_image"
                src={`http://${props.ip}:8001/${props.alert_data.image_path}`}
                alt="post"
                loading="lazy"
              ></LazyLoadImage>
            </div>
          ) : (
            ""
          )}
        </div>

        <div className="alert_date">
          {props.alert_data.date} {props.alert_data.time}
        </div>
      </div>
    </div>
  );
};

export default Alert;
