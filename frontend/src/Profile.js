import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Profile.css";
import { useHistory } from "react-router-dom";
import * as IconSet from "react-icons/fa";
import axios from "axios";
import Suggests_for_you from "./Suggests_for_you";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Switch_Btn from "./Switch_Btn";

const Profile = (props) => {
  const history = useHistory();
  const location = useLocation();

  const [is_follow_send, set_is_follow_send] = useState(false);
  const [userdata, set_userdata] = useState(location.state);
  const [my_data, set_my_data] = useState(location.state);
  const [followers, set_followers] = useState(userdata.followers);
  const [is_user_followed, set_is_user_followed] = useState(false);
  // const [my_user_id, set_my_user_id] = useState(location.state.this_user_id);
  const [is_large_image, set_is_large_image] = useState(false);
  const [all_my_posts, set_all_my_posts] = useState([]);
  const [selected_icon, set_selected_icon] = useState("my posts");
  const [all_my_liked_posts, set_all_my_liked_posts] = useState([]);
  const [is_activate, set_is_activate] = useState(false);
  const [my_user_id] = useState(location.state.this_user_id);
  const [folloers_or_followying, followers_or_followying] = useState("");
  const [f_users, set_f_users] = useState([]);
  const [all_users_array, set_all_users_array] = useState([]);

  const is_show_post = () => {
    if (my_data.user_id === userdata.user_id) return true;
    if (userdata.is_private === 0) return true;
    return userdata.followers_id.includes("," + my_data.user_id + ",");
  };
  const load_users = (folloers_or_followying) => {
    axios
      .post(`http://${props.ip}:8001/get_users`, {
        user_id: userdata.user_id,
        followers_or_followying: folloers_or_followying,
      })
      .then((response) => {
        if (response.status === 200) {
          set_f_users(response.data);
          set_all_users_array(response.data);
        }
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    if (my_user_id) {
      props.socket.on(
        `set_user_${userdata.user_id}_private_state`,
        (is_private) => {
          set_userdata((prev_userdata) => ({
            ...prev_userdata,
            is_private: is_private ? 1 : 0,
          }));
        }
      );
    }
  }, []);

  useEffect(() => {
    axios
      .post(`http://${props.ip}:8001/get_userdata`, {
        user_id: userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          set_userdata(response.data);
          if (my_user_id !== userdata.user_id)
            set_is_activate(response.data.is_private === 1);
          if (my_user_id) {
            axios
              .post(`http://${props.ip}:8001/get_userdata`, {
                user_id: my_user_id,
              })
              .then((response) => {
                if (response.status === 200) {
                  if (response.data.current_page !== "Profile") {
                    axios
                      .post(`http://${props.ip}:8001/set_current_page`, {
                        user_id: my_user_id,
                        current_page: "Profile",
                      })
                      .then((response) => {
                        if (response.status === 200) {
                          const data = {
                            looking_user: my_user_id,
                            looked_user: userdata.user_id,
                          };
                          props.socket.emit("user_is_in_other_user", data);
                        }
                      })
                      .catch((err) => console.log(err));
                  }
                  set_my_data(response.data);
                  set_is_activate(
                    response.data.stoke_mode.includes(
                      "," + userdata.user_id + ","
                    )
                  );
                  if (
                    response.data.following_id.includes(`,${userdata.user_id},`)
                  )
                    set_is_user_followed(true);
                }
              })
              .catch((err) => console.log(err));
            axios.post(`http://${props.ip}:8001/set_is_connected`, {
              user_id: my_user_id,
              is_connected: true,
            });
          } else {
            axios.post(`http://${props.ip}:8001/set_is_connected`, {
              user_id: response.data.user_id,
              is_connected: true,
            });
          }
        }
      })
      .catch((err) => console.log(err));

    axios
      .post(`http://${props.ip}:8001/get_is_send_follow`, {
        this_user_id: my_data.user_id,
        other_user_id: userdata.user_id,
        is_follow_send: !is_follow_send,
      })
      .then((response) => {
        if (response.status === 200) {
          set_is_follow_send(true);
        }
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/get_all_my_posts`, {
        user_id: userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_all_my_posts(response.data);
        }
      })
      .catch((err) => console.log(err));
    if (userdata.user_id === my_data.user_id) {
      axios
        .post(`http://${props.ip}:8001/get_all_liked_posts`, {
          user_id: userdata.user_id,
        })
        .then((response) => {
          if (response.status === 200) {
            set_all_my_liked_posts(response.data);
          }
        })
        .catch((err) => console.log(err));
    }
  }, []);

  function handleFollow() {
    if (is_user_followed) {
      axios
        .post(`http://${props.ip}:8001/remove_follow`, {
          follow_user_id: my_data.user_id,
          user_id: userdata.user_id,
        })
        .then((response) => {
          if (response.status === 200) {
            console.log("follow added");
            set_followers(followers - 1);
            set_is_user_followed(false);
          }
        })
        .catch((err) => console.log(err));
    } else {
      if (userdata.is_private !== 0) {
        axios
          .post(`http://${props.ip}:8001/send_follow_request`, {
            this_user_id: my_data.user_id,
            other_user_id: userdata.user_id,
            is_follow_send: !is_follow_send,
            this_user_name: my_data.user_name,
          })
          .then((response) => {
            if (response.status === 200) {
              const other_user_id = userdata.user_id;

              set_is_follow_send(!is_follow_send);
              if (!is_follow_send) {
                props.socket.emit("send_follow_request", other_user_id);
              } else {
                props.socket.emit("remove_follow_request", other_user_id);
              }
            }
          })
          .catch((err) => console.log(err));
      } else {
        axios
          .post(`http://${props.ip}:8001/set_new_follow`, {
            request_user_id: my_data.user_id,
            recived_user_id: userdata.user_id,
          })
          .then((response) => {
            if (response.status === 200) {
              console.log("follow added");
              set_followers(followers + 1);
              set_is_user_followed(true);
            }
          })
          .catch((err) => console.log(err));
      }
    }
  }
  const handleState = () => {
    if (my_data.user_id === userdata.user_id) {
      axios
        .post(`http://${props.ip}:8001/set_private_state`, {
          user_id: my_data.user_id,
          is_activate: !is_activate,
        })
        .then((response) => {
          if (response.status === 200) {
            const data = {
              is_private: !is_activate,
              user_id: my_data.user_id,
            };
            props.socket.emit("set_private_state", data);

            set_is_activate(!is_activate);
          }
        })
        .catch((err) => console.log(err));
    } else {
      if (my_data.stoke_users < 2 || is_activate) {
        axios
          .post(`http://${props.ip}:8001/set_stoke_mode_state`, {
            my_user_id: my_data.user_id,
            other_user_id: userdata.user_id,
            is_activate: !is_activate,
          })
          .then((response) => {
            if (response.status === 200) {
              set_is_activate(!is_activate);
            }
          })
          .catch((err) => console.log(err));
      } else {
        alert("you can only have 2 stoke users");
      }
    }
  };
  function handlechange(e) {
    if (e.target.value === "") set_f_users(all_users_array);
    set_f_users(
      all_users_array.filter((item) => item.user_name.includes(e.target.value))
    );
  }
  return (
    <div className="all_profile">
      <IconSet.FaArrowAltCircleLeft
        className="profile_back_arrow"
        onClick={() => {
          history.push({
            pathname: "/Tweets",
            state: { ...my_data, is_me: true },
          });
        }}
      ></IconSet.FaArrowAltCircleLeft>
      <div className="profile_header">
        <div className="user_image_container">
          {userdata.profile_image === "null" ? (
            <IconSet.FaUserCircle className="profile_user_image"></IconSet.FaUserCircle>
          ) : (
            <img
              onClick={() => {
                set_is_large_image(true);
              }}
              className="profile_user_image"
              src={`http://${props.ip}:8001/${userdata.profile_image}`}
              alt="profile"
            ></img>
          )}{" "}
        </div>

        <div>{userdata.user_name}</div>
        <div className="followers">
          <button
            onClick={() => {
              followers_or_followying("followers");
              load_users("followers");
            }}
          >
            {userdata.followers} followers
          </button>
          <button
            onClick={() => {
              followers_or_followying("followying");
              load_users("followying");
            }}
          >
            {userdata.following} following
          </button>
        </div>
        {userdata.user_id === my_data.user_id ? (
          <button
            className="edit"
            onClick={() => {
              history.push({
                pathname: "/Edit_Profile",
                state: userdata,
              });
            }}
          >
            edit profile
          </button>
        ) : (
          <button className="Follow" onClick={handleFollow}>
            {is_user_followed
              ? "UNFOLLOW"
              : `${
                  userdata.is_private !== 0
                    ? `${is_follow_send ? "Requested" : "Follow"}`
                    : "Follow"
                }`}
          </button>
        )}
      </div>
      <div>
        <Switch_Btn
          is_active={is_activate}
          handleState={handleState}
        ></Switch_Btn>
        <div>
          {my_data.user_id === userdata.user_id
            ? `${
                is_activate ? "disable private mode" : "activate private mode"
              }`
            : `${is_activate ? "disable stoke mode" : "activate stoke mode"}`}
        </div>
      </div>
      {is_show_post() ? (
        <div className="profile_footer">
          <div className="select_posts">
            <IconSet.FaImage
              className={
                selected_icon === "my posts" ? "icon selected_icon" : "icon"
              }
              onClick={() => {
                set_selected_icon("my posts");
              }}
            ></IconSet.FaImage>
            {userdata.user_id === my_data.user_id ? (
              <IconSet.FaHeart
                className={
                  selected_icon === "liked posts"
                    ? "icon selected_icon"
                    : "icon"
                }
                onClick={() => {
                  set_selected_icon("liked posts");
                }}
              ></IconSet.FaHeart>
            ) : (
              ""
            )}
          </div>

          {
            <div className="all_my_posts_container">
              {selected_icon === "my posts" ? (
                all_my_posts.length === 0 ? (
                  <div className="zero_posts">you have 0 posts</div>
                ) : (
                  all_my_posts.map((item) => {
                    return (
                      <div
                        className="post_small_image_container"
                        key={item.post_id}
                        onClick={() => {
                          const data = {
                            looking_user: my_data.user_id,
                            looked_user: userdata.user_id,
                            post_id: item.post_id,
                          };
                          props.socket.emit("user_is_in_other_user_post", data);
                          history.push({
                            pathname: "/show_post",
                            state: {
                              post_data: item,
                              userdata: my_data,
                              post_array: all_my_posts,
                              other_user_id: userdata.user_id,
                            },
                          });
                        }}
                      >
                        {" "}
                        <LazyLoadImage
                          className="post_small_image"
                          src={`http://${props.ip}:8001/${item.image_path}`}
                          alt="post"
                        ></LazyLoadImage>
                        <div className="post_like_number">
                          <span>{item.likes_numbers}</span>
                          <IconSet.FaHeart></IconSet.FaHeart>
                        </div>
                      </div>
                    );
                  })
                )
              ) : all_my_liked_posts.length === 0 ? (
                <div className="zero_posts">you have 0 posts</div>
              ) : (
                all_my_liked_posts.map((item) => {
                  return (
                    <div
                      className="post_small_image_container"
                      key={item.post_id}
                      onClick={() => {
                        const data = {
                          looking_user: my_data.user_id,
                          looked_user: userdata.user_id,
                          post_id: item.post_id,
                        };
                        props.socket.emit("user_is_in_other_user_post", data);

                        history.push({
                          pathname: "/show_post",
                          state: {
                            post_data: item,
                            userdata: my_data,
                            post_array: all_my_liked_posts,
                          },
                        });
                      }}
                    >
                      {" "}
                      <LazyLoadImage
                        className="post_small_image"
                        src={`http://${props.ip}:8001/${item.image_path}`}
                        alt="post"
                      ></LazyLoadImage>
                      <div className="post_like_number">
                        <span>{item.likes_numbers}</span>
                        <IconSet.FaHeart></IconSet.FaHeart>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          }
        </div>
      ) : (
        <h1>Private acount</h1>
      )}

      {is_large_image ? (
        <div
          className="large_profile_image_container"
          onClick={() => {
            set_is_large_image(false);
          }}
        >
          <img
            className="large_profile_image"
            src={`http://${props.ip}:8001/${userdata.profile_image}`}
            alt="profile"
          ></img>

          <div
            className="cancle"
            onClick={() => {
              set_is_large_image(false);
            }}
          >
            <IconSet.FaTimes></IconSet.FaTimes>
          </div>
        </div>
      ) : (
        ""
      )}
      {folloers_or_followying !== "" ? (
        <div className="seen_by_page">
          <div
            className="seen_by_cover"
            onClick={() => followers_or_followying("")}
          ></div>
          <div className="seen_by_user_container">
            <div className="seen_by_header">
              <IconSet.FaTimes
                className="cancle_icon"
                onClick={() => {
                  followers_or_followying("");
                }}
              ></IconSet.FaTimes>

              <h2>{folloers_or_followying}</h2>
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
              {f_users.map((item) => {
                return (
                  <div className="seen_user">
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
    </div>
  );
};

export default Profile;
