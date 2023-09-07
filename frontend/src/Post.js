import React, {
  Component,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import "./Post.css";
import * as IconSet from "react-icons/fa";
import Comment from "./Comment";
import axios from "axios";
import { useHistory } from "react-router-dom";
import Send_Post from "./Send_Post";

import { LazyLoadImage } from "react-lazy-load-image-component";
const Post = (props) => {
  const [post_data, set_post_data] = useState(props.post_data);
  const [is_show_comments, set_show_comments] = useState(false);
  const [is_post_liked, set_is_post_liked] = useState(false);
  const [is_show_heart, set_is_show_heart] = useState(false);
  const [likes_number, set_likes_number] = useState(post_data.likes_numbers);
  const [send_post, set_send_post] = useState(false);
  const [selected_post_id, set_selected_post_id] = useState({
    id: -1,
    image_path: "",
  });
  const [comment, set_comment] = useState("");
  const [all_comments, set_all_comments] = useState([]);
  const [comments_order, set_comments_order] = useState(0);
  const [father_comment_id, set_father_comment_id] = useState(-1);
  const [root_comment_id, set_root_comment_id] = useState(-1);

  const [reply_to_user_id, set_reply_to_user_id] = useState(-1);
  const [reply_user_name, set_reply_user_name] = useState("");
  const [comments_number, set_comments_number] = useState(0);
  const [comment_id, set_comment_id] = useState(-1);
  const [is_delete_post, set_is_delete_post] = useState(false);
  const [is_liked_by, set_is_liked_by] = useState(false);
  const [all_users_array, set_all_users_array] = useState([]);

  const [like_users, set_like_users] = useState([]);

  const history = useHistory();
  const ref = useRef(null);
  const load_users = () => {
    axios
      .post(`http://${props.ip}:8001/get_users_who_like_post`, {
        post_id: props.post_data.post_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_like_users(response.data);
          set_all_users_array(response.data);
        }
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    set_comment_id(props.comment_id ? props.comment_id : -1);
    if (props.comment_id) {
      load_comments();
      set_show_comments(true);
    }
    ref.current?.scrollIntoView({ behavior: "smooth" });

    axios
      .post(`http://${props.ip}:8001/get_post_data`, {
        post_id: post_data.post_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_post_data(response.data);
          set_is_post_liked(
            response.data.liked_by.includes("," + props.userdata.user_id + ",")
          );
          set_comments_number(response.data.comments_number);
          set_likes_number(response.data.likes_numbers);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const [is_show_broken_heart, set_is_show_broken_heart] = useState(false);
  function handle_image_cliked() {
    if (is_post_liked) {
      set_is_show_broken_heart(true);
      set_is_post_liked(false);
      set_likes_number(likes_number - 1);
      handleLike(false);
    } else {
      set_is_show_heart(true);
      set_is_post_liked(true);
      set_likes_number(likes_number + 1);
      handleLike(true);
    }
    setTimeout(() => {
      set_is_show_heart(false);
      set_is_show_broken_heart(false);
    }, 600);
  }
  function handleLike(is_like) {
    axios
      .post(`http://${props.ip}:8001/set_likes`, {
        post_id: post_data.post_id,
        my_user_id: props.userdata.user_id,
        is_like: is_like,
        father_comment_id: father_comment_id,
      })
      .then((response) => {
        if (response.status === 200) {
          if (props.userdata.user_id !== post_data.post_user_id) {
            if (is_like) {
              axios
                .post(`http://${props.ip}:8001/add_alert`, {
                  recived_user: post_data.post_user_id,
                  post_id: props.post_data.post_id,
                  alert_user_id: props.userdata.user_id,
                  comment_id: -1,
                  alert: "liked your post",
                })
                .then((response) => {
                  if (response.status === 200) {
                  }
                })
                .catch((err) => console.log(err));
            } else {
              axios
                .post(`http://${props.ip}:8001/remove_alert`, {
                  alert_user_id: props.userdata.user_id,

                  post_id: post_data.post_id,
                  alert: "liked your post",
                })
                .then((response) => {
                  if (response.status === 200) {
                  }
                })
                .catch((err) => console.log(err));
            }
          }
        }
      })
      .catch((err) => console.log(err));
  }

  function handleComment() {
    axios
      .post(`http://${props.ip}:8001/add_comment`, {
        post_user_id: props.userdata.user_id,
        comment: comment,
        father_comment_id: father_comment_id,
        root_comment_id: root_comment_id,
        comments_order: comments_order,
        post_id: post_data.post_id,
      })
      .then((response) => {
        if (response.status === 200) {
          let new_array = [
            ...all_comments,
            {
              comment: response.data.comment,
              comment_id: response.data.comment_id,
              comments_order: comments_order,
              father_comment_id: response.data.father_comment_id,
              date: response.data.date,
              post_user_id: response.data.post_user_id,
              time: response.data.time,
              user_name: props.userdata.user_name,
              profile_image: props.userdata.profile_image,
              is_comment_reply: response.data.father_comment_id !== -1,
            },
          ];
          set_all_comments(new_array);
          set_comment("");
          set_comments_number(comments_number + 1);

          set_comments_order(comments_number + 1);
          set_reply_user_name("");
          set_comments_number(comments_number + 1);
          set_father_comment_id(-1);
          set_root_comment_id(-1);
          axios
            .post(`http://${props.ip}:8001/get_post_comments`, {
              post_id: post_data.post_id,
            })
            .then((response) => {
              if (response.status === 200) {
                set_all_comments(response.data);
                set_comments_number(response.data.length);
              }
            })
            .catch((err) => console.log(err));
          if (props.userdata.user_id !== post_data.post_user_id) {
            axios
              .post(`http://${props.ip}:8001/add_alert`, {
                recived_user: post_data.post_user_id,
                post_id: props.post_data.post_id,
                comment_id: response.data.comment_id,
                alert_user_id: props.userdata.user_id,
                alert: "comment on your post:",
              })
              .then((res) => {
                if (res.status === 200) {
                  if (father_comment_id !== -1) {
                    axios
                      .post(`http://${props.ip}:8001/add_alert`, {
                        recived_user: reply_to_user_id,
                        post_id: props.post_data.post_id,
                        comment_id: response.data.comment_id,
                        alert_user_id: props.userdata.user_id,
                        alert: "reply to your comment:",
                      })
                      .then((response) => {
                        if (response.status === 200) {
                          set_reply_to_user_id(-1);
                          set_father_comment_id(-1);
                          set_root_comment_id(-1);
                        }
                      })
                      .catch((err) => console.log(err));
                  }
                }
              })
              .catch((err) => console.log(err));
          }
        }
      })
      .catch((err) => console.log(err));
  }
  function hanlecallback(
    comment_id,
    root_comment_id,
    comment_order,
    user_name,
    post_user_id
  ) {
    set_father_comment_id(comment_id);
    set_root_comment_id(root_comment_id !== -1 ? root_comment_id : comment_id);
    set_reply_to_user_id(post_user_id);
    console.log(post_user_id);
    set_comments_order(comment_order);
    set_comment(`reply to @${user_name}:`);
    set_reply_user_name(`reply to @${user_name}:`);
  }
  const load_comments = async () => {
    axios
      .post(`http://${props.ip}:8001/get_post_comments`, {
        post_id: post_data.post_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_all_comments(response.data);
        }
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/get_comments_number`, {
        post_id: post_data.post_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_comments_number(response.data);
          set_comments_order(response.data);
        }
      })
      .catch((err) => console.log(err));
  };
  const handle_delete_comment = (comment_id) => {
    axios
      .post(`http://${props.ip}:8001/remove_comment`, {
        comment_id: comment_id,
        post_id: post_data.post_id,
      })
      .then((response) => {
        if (response.status === 200) {
          let new_comments_array = [];
          console.log(new_comments_array);
          console.log(comment_id);
          all_comments.map((item) => {
            if (
              !(
                item.comment_id === comment_id ||
                item.root_comment_id === comment_id
              )
            )
              new_comments_array.push(item);
          });
          console.log(new_comments_array);
          set_all_comments(new_comments_array);
          set_comments_number(comments_number - response.data);
        }
      })
      .catch((err) => console.log(err));
  };
  function handle_delete_post() {
    axios
      .post(`http://${props.ip}:8001/remove_post`, {
        post_id: post_data.post_id,
      })
      .then((response) => {
        if (response.status === 200) {
          const userdata = {
            user_id: post_data.post_user_id,
            is_me: post_data.post_user_id === props.userdata.user_id,
            this_user_id: props.userdata.user_id,
          };
          history.push({
            pathname: "/Profile",
            state: userdata,
          });
        }
      })
      .catch((err) => console.log(err));
  }
  function handlechange(e) {
    if (e.target.value === "") set_like_users(all_users_array);
    set_like_users(
      all_users_array.filter((item) => item.user_name.includes(e.target.value))
    );
  }
  const handleShare = (post_id, image_path, is_closed) => {
    if (is_closed) {
      set_send_post(false);
    } else set_send_post(true);
    set_selected_post_id({ id: post_id, image_path: image_path });
    console.log(post_id);
  };
  return (
    <div
      className={
        is_show_comments ? "post_container show_comments" : "post_container"
      }
    >
      <div className="post_header" ref={props.reff}>
        <div className="post_user_data">
          <div className="post_user_image_container">
            {post_data.profile_image === "null" ? (
              <IconSet.FaUserCircle className="post_profile_user_image"></IconSet.FaUserCircle>
            ) : (
              <img
                className="post_profile_user_image"
                src={`http://${props.ip}:8001/${post_data.profile_image}`}
                alt="profile"
              ></img>
            )}{" "}
          </div>
          <span
            onClick={() => {
              const userdata = {
                user_id: post_data.post_user_id,
                is_me: post_data.post_user_id === props.userdata.user_id,
                this_user_id: props.userdata.user_id,
              };
              history.push({
                pathname: "/Profile",
                state: userdata,
              });
            }}
          >
            {post_data.user_name}
          </span>
        </div>
        {props.userdata.user_id === post_data.post_user_id ? (
          <div className="delete_post">
            {" "}
            <IconSet.FaTrash
              onClick={() => {
                console.log("trash clicked");
                set_is_delete_post(true);
              }}
            ></IconSet.FaTrash>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="post_main">
        <LazyLoadImage
          onDoubleClick={() => handle_image_cliked()}
          className="post_main_image"
          src={`http://${props.ip}:8001/${post_data.image_path}`}
          alt="profile"
          loading="lazy"
        ></LazyLoadImage>

        {is_show_heart || is_show_broken_heart ? (
          <div className="post_cover">
            {is_show_heart ? (
              <IconSet.FaHeart className="like"></IconSet.FaHeart>
            ) : (
              ""
            )}
            {is_show_broken_heart ? (
              <IconSet.FaHeartBroken className="unlike"></IconSet.FaHeartBroken>
            ) : (
              ""
            )}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="post_footer">
        <div className="post_icones">
          <IconSet.FaHeart
            className={is_post_liked ? " post_icon post_liked" : "post_icon"}
            onClick={() => {
              set_is_post_liked(!is_post_liked);
              if (is_post_liked) {
                set_likes_number(likes_number - 1);
                handleLike(false);
              } else {
                set_likes_number(likes_number + 1);
                handleLike(true);
              }
            }}
          ></IconSet.FaHeart>

          <IconSet.FaComment
            className="post_icon"
            onClick={() => {
              if (!is_show_comments) {
                load_comments();
                const data = {
                  looking_user: props.userdata.user_id,
                  looked_user: post_data.post_user_id,
                  post_id: props.post_data.post_id,
                };
                props.socket.emit("user_is_in_other_user_commments", data);
              }

              set_show_comments(!is_show_comments);
            }}
          ></IconSet.FaComment>
          <IconSet.FaShare
            className="post_icon"
            onClick={() => {
              set_send_post(true);
            }}
          ></IconSet.FaShare>
        </div>
        <div
          className="liked_by"
          onClick={() => {
            load_users();
            set_is_liked_by(true);
          }}
        >
          liked by {likes_number} people
        </div>
        <div
          className="liked_by"
          onClick={() => {
            set_show_comments(true);
          }}
        >
          {" "}
          {comments_number} comments
        </div>
        <div className="short_dis">{post_data.short_dis}</div>
      </div>
      {is_show_comments ? (
        <div
          className="page_cover"
          onClick={() => {
            set_show_comments(false);
          }}
        ></div>
      ) : (
        ""
      )}
      {is_show_comments ? (
        <div className="comments_container">
          <div className="comments_header">
            <IconSet.FaTimes
              style={{ fontSize: "1.5rem" }}
              onClick={() => {
                set_show_comments(false);
              }}
            ></IconSet.FaTimes>
            <span>Comments</span>
          </div>
          <div className="comments">
            {all_comments.length > 0 ? (
              all_comments.map((item) => {
                console.log(item.comment_id === props.comment_id);
                return (
                  <Comment
                    key={item.comment_id}
                    comment_data={item}
                    is_comment_reply={item.father_comment_id !== -1}
                    callback={hanlecallback}
                    ip={props.ip}
                    my_user_id={props.userdata.user_id}
                    reff={item.comment_id === props.comment_id ? ref : null}
                    is_show_delete={
                      props.userdata.user_id === post_data.post_user_id ||
                      props.userdata.user_id === item.post_user_id
                    }
                    handle_delete_comment={handle_delete_comment}
                  ></Comment>
                );
              })
            ) : (
              <div className="no_comments">no comments... be the first</div>
            )}
          </div>

          <div className="add_comment">
            <textarea
              placeholder="comment..."
              maxLength={120}
              value={comment}
              onChange={(e) => {
                set_comment(e.target.value);
                if (
                  reply_user_name !== "" &&
                  !e.target.value.includes(reply_user_name)
                ) {
                  set_father_comment_id(-1);
                  set_root_comment_id(-1);
                  set_reply_to_user_id(-1);
                  set_comments_order(comments_number);
                  set_reply_user_name("");
                }
              }}
            ></textarea>
            <IconSet.FaPaperPlane
              className="send_comment_icon"
              onClick={() => {
                handleComment();
              }}
            ></IconSet.FaPaperPlane>
          </div>
        </div>
      ) : (
        ""
      )}
      {is_delete_post ? (
        <div className="delete_page_cover">
          <div className="delete_massege">
            <span>are you sure you want to delete this post?</span>
            <div>
              <button
                onClick={() => {
                  handle_delete_post();
                }}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  set_is_delete_post(false);
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
      {is_liked_by ? (
        <div className="seen_by_page">
          <div
            className="seen_by_cover"
            onClick={() => set_is_liked_by(false)}
          ></div>
          <div className="seen_by_user_container">
            <div className="seen_by_header">
              <IconSet.FaTimes
                className="cancle_icon"
                onClick={() => {
                  set_is_liked_by(false);
                }}
              ></IconSet.FaTimes>

              <h2>Liked the post</h2>
            </div>

            <div className="seen_by_main">
              <div className="search_bubble">
                <input
                  type="text"
                  placeholder="search..."
                  onChange={(e) => {
                    handlechange(e);
                  }}
                ></input>
                <button>
                  <IconSet.FaSearch></IconSet.FaSearch>
                </button>
              </div>
              {like_users.map((item) => {
                return (
                  <div
                    className="seen_user"
                    onClick={() => {
                      const userdata = {
                        user_id: item.user_id,
                        is_me: props.userdata.user_id === item.user_id,
                        this_user_id: props.userdata.user_id,
                      };
                      history.push({
                        pathname: "/Profile",
                        state: userdata,
                      });
                    }}
                  >
                    {item.profile_image === "null" ? (
                      <IconSet.FaUserCircle className="story_profile_user_image"></IconSet.FaUserCircle>
                    ) : (
                      <img
                        className="story_profile_user_image"
                        src={`http://${props.ip}:8001/${item.profile_image}`}
                        alt="profile"
                      ></img>
                    )}{" "}
                    <span>{item.user_name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {send_post ? (
        <div className="send_post_container">
          <div
            className="send_post_cover"
            onClick={() => {
              set_send_post(false);
            }}
          ></div>
          <div className="send_post_container_footer">
            <Send_Post
              socket={props.socket}
              ip={props.ip}
              userdata={props.userdata}
              post_id={post_data.post_id}
              image_path={post_data.image_path}
              send_post={handleShare}
              user_name={post_data.user_name}
              profile_image={post_data.profile_image}
              followers_id={post_data.followers_id}
              is_private={post_data.is_private === 1 ? true : false}
              post_user_id={post_data.post_user_id}
            ></Send_Post>
          </div>
        </div>
      ) : (
        ""
      )}{" "}
    </div>
  );
};

export default forwardRef(Post);
