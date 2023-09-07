import React, { useEffect, forwardRef, useState, useRef } from "react";
import "./Comment.css";
import * as IconSet from "react-icons/fa";
import { useHistory } from "react-router-dom";
import axios from "axios";

const Comment = (props) => {
  const history = useHistory();

  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div>
      <div className="comment_background"></div>
      <div
        ref={props.reff}
        className={
          props.is_comment_reply
            ? "comment_container comment_is_reply"
            : "comment_container"
        }
      >
        <div className="comment_user_name">
          <div className="comment_header">
            <div className="comment_user_data">
              {props.comment_data.profile_image === "null" ? (
                <IconSet.FaUserCircle className="comment_user_image"></IconSet.FaUserCircle>
              ) : (
                <img
                  className="comment_user_image"
                  src={`http://${props.ip}:8001/${props.comment_data.profile_image}`}
                  alt="profile"
                  onClick={() => {
                    const userdata = {
                      user_id: props.comment_data.post_user_id,
                      is_me:
                        props.comment_data.post_user_id === props.my_user_id,
                      this_user_id: props.my_user_id,
                    };
                    history.push({
                      pathname: "/Profile",
                      state: userdata,
                    });
                  }}
                ></img>
              )}{" "}
              <span
                onClick={() => {
                  const userdata = {
                    user_id: props.comment_data.post_user_id,
                    is_me: props.comment_data.post_user_id === props.my_user_id,
                    this_user_id: props.my_user_id,
                  };
                  history.push({
                    pathname: "/Profile",
                    state: userdata,
                  });
                }}
              >
                {props.comment_data.user_name}:
              </span>
            </div>
            {props.is_show_delete ? (
              <div
                className="delete_comment"
                onClick={() => {
                  props.handle_delete_comment(props.comment_data.comment_id);
                }}
              >
                {" "}
                <IconSet.FaTrash></IconSet.FaTrash>
              </div>
            ) : (
              ""
            )}
          </div>
          {props.is_comment_reply ? (
            <div className="reply_container">
              reply to{" "}
              <span className="reply_user_link">
                @{props.comment_data.father_user_name}
              </span>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="comment_text">{props.comment_data.comment}</div>
        <div className="comment_bottom">
          <div
            className="reply_comment"
            onClick={() => {
              if (props.is_comment_reply === false)
                console.log(props.comment_data.comments_order);
              props.callback(
                props.comment_data.comment_id,
                props.comment_data.root_comment_id,
                props.comment_data.comments_order,
                props.comment_data.user_name,
                props.comment_data.post_user_id
              );
            }}
          >
            <IconSet.FaReply className="reply_icon"></IconSet.FaReply>
            <span>reply</span>
          </div>
          <div className="comment_date">
            {props.comment_data.date} {props.comment_data.time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(Comment);
