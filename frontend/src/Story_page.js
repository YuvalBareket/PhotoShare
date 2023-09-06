import React, { useEffect, useState } from "react";
import "./Stories.css";
import * as IconSet from "react-icons/fa";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useHistory } from "react-router-dom";

const Story_page = (props) => {
  const history = useHistory();
  const [story_number, set_story_number] = useState(props.first_unseen_story);
  const [user_stories, set_user_stories] = useState(props.stories);
  const [repeat, set_reapet] = useState("");
  const [is_massege_sent, set_is_massege_sent] = useState(false);
  const [is_delete_story, set_is_delete_story] = useState(false);
  const [is_show_seen_by, set_is_show_seen_by] = useState(false);
  const [seen_users, set_seen_users] = useState([]);

  const [all_users_array, set_all_users_array] = useState([]);

  const [search, set_search] = useState("");

  const load_users = () => {
    axios
      .post(`http://${props.ip}:8001/get_users_who_seen_story`, {
        story_id: user_stories[story_number].story_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_seen_users(response.data);
          set_all_users_array(response.data);
        }
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    console.log(user_stories);
    axios
      .post(`http://${props.ip}:8001/set_user_seen_story`, {
        user_id: props.userdata.user_id,
        story_id: user_stories[story_number].story_id,
      })
      .then((response) => {
        if (response.status === 200) {
          if (story_number === user_stories.length - 1) {
            const data = {
              watched_user: props.userdata.user_id,
              post_user: user_stories[story_number].post_user_id,
            };
            props.socket.emit("user_watched_all_stories", data);
          }
        }
      })
      .catch((err) => console.log(err));
  }, []);
  useEffect(() => {
    setTimeout(() => {
      set_is_massege_sent(false);
    }, 800);
  }, [is_massege_sent]);
  function handleMoveImage(e) {
    if (window.innerHeight - e.pageY > 60 && e.pageY > 80) {
      const screen_size = window.innerWidth;
      if (story_number === user_stories.length - 1) {
        const data = {
          watched_user: props.userdata.user_id,
          post_user: user_stories[story_number].post_user_id,
        };
        props.socket.emit("user_watched_all_stories", data);
      }
      if (
        e.pageX > screen_size / 2 + 1 &&
        story_number < user_stories.length - 1
      ) {
        set_story_number(story_number + 1);

        if (
          !user_stories[story_number + 1].seen_by.includes(
            `,${props.userdata.user_id},`
          )
        )
          axios
            .post(`http://${props.ip}:8001/set_user_seen_story`, {
              user_id: props.userdata.user_id,
              story_id: user_stories[story_number + 1].story_id,
            })
            .then((response) => {
              if (response.status === 200) {
              }
            })
            .catch((err) => console.log(err));
      }
      if (e.pageX <= screen_size / 2 + 1 && story_number > 0)
        set_story_number(story_number - 1);
    }
  }
  const handleclick = async () => {
    const current_date = new Date();
    if (repeat !== "") {
      const massegeData = {
        room: user_stories[0].room,
        user_name: "",
        massege: repeat,
        time: current_date.getHours() + ":" + current_date.getMinutes(),
        image_path: user_stories[story_number].image_path,
      };
      await props.socket.emit("send_msg", massegeData);

      axios
        .post(`http://${props.ip}:8001/insert_masseges`, {
          room: user_stories[0].room,
          my_user_id: props.userdata.user_id,
          current_msg: repeat,
          is_read: false,
          story_id: user_stories[story_number].story_id,
          post_id: -1,
        })
        .then((response) => {
          const data = {
            recived_user: user_stories[story_number].post_user_id,
            send_user: props.userdata.user_id,
          };
          props.socket.emit(`massege_number_plus`, data);

          if (response.status === 200) {
            console.log("insert masseges sucsess");
            set_reapet("");
            set_is_massege_sent(true);
          }
          props.socket.emit("massege_send", 2);
        })
        .catch((err) => console.log(err));
    }
  };

  // const handleBackButton = () => {
  //   history.push({
  //     pathname: "/Tweets",
  //     state: props.userdata,
  //   });
  // };

  // window.addEventListener("popstate", handleBackButton);
  function handle_delete_story() {
    axios
      .post(`http://${props.ip}:8001/remove_story`, {
        story_id: user_stories[story_number].story_id,
      })
      .then((response) => {
        if (response.status === 200) {
          let new_story_array = [];

          user_stories.map((story) => {
            if (story.story_id !== user_stories[story_number].story_id)
              new_story_array.push(story);
          });

          if (
            new_story_array.length === 0 ||
            story_number === new_story_array.length
          )
            props.closestory();
          else set_user_stories(new_story_array);
        }
      })
      .catch((err) => console.log(err));
    set_is_delete_story(false);
  }

  function handlechange(e) {
    if (e.target.value === "") set_seen_users(all_users_array);
    set_seen_users(
      all_users_array.filter((item) => item.user_name.includes(e.target.value))
    );
    set_search(e.target.value);
  }
  return (
    <div>
      <div className="story_page_bg_cover"></div>
      <div
        className="story_page_cover"
        onClick={(e) => {
          handleMoveImage(e);
        }}
      >
        <div className="story_page_main">
          <LazyLoadImage
            className="main_story_image"
            src={`http://${props.ip}:8001/${user_stories[story_number].image_path}`}
            alt="story"
          ></LazyLoadImage>
          <div className="story_page_header">
            <div className="story_page_user_data">
              <IconSet.FaArrowAltCircleLeft
                className="back_arrow"
                onClick={props.closestory}
              ></IconSet.FaArrowAltCircleLeft>
              <div className="story_user_image_container">
                {user_stories[0].profile_image === "null" ? (
                  <IconSet.FaUserCircle className="story_profile_user_image"></IconSet.FaUserCircle>
                ) : (
                  <img
                    className="story_profile_user_image"
                    src={`http://${props.ip}:8001/${user_stories[0].profile_image}`}
                    alt="profile"
                  ></img>
                )}{" "}
              </div>
              <span>{user_stories[0].user_name}</span>
              {user_stories[story_number].post_user_id ===
              props.userdata.user_id ? (
                <div className="delete_post">
                  {" "}
                  <IconSet.FaTrash
                    onClick={() => {
                      set_is_delete_story(true);
                    }}
                  ></IconSet.FaTrash>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="all_stories_bar">
              {user_stories.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={
                      story_number === index
                        ? "story_bar current_story"
                        : "story_bar"
                    }
                  ></div>
                );
              })}
            </div>
          </div>
          {is_massege_sent ? (
            <div className="massege_sent">Massege sent</div>
          ) : (
            ""
          )}
        </div>
        {user_stories[story_number].post_user_id !== props.userdata.user_id ? (
          <div className="story_page_footer">
            <input
              type="text"
              placeholder={`write to ${user_stories[0].user_name}...`}
              onChange={(e) => {
                set_reapet(e.target.value);
              }}
              value={repeat}
            ></input>
            <IconSet.FaPaperPlane
              className="send_icon"
              onClick={() => handleclick()}
            ></IconSet.FaPaperPlane>
          </div>
        ) : (
          <div
            className="seen_by_number"
            onClick={() => {
              load_users();
              set_is_show_seen_by(true);
            }}
          >
            <span> {user_stories[story_number].seen_by_number}</span>
            <IconSet.FaRegEye className="eye_icon"></IconSet.FaRegEye>
          </div>
        )}
      </div>
      {is_delete_story ? (
        <div className="delete_page_cover">
          <div className="delete_massege">
            <span>are you sure you want to delete this story?</span>
            <div>
              <button
                onClick={() => {
                  handle_delete_story();
                }}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  set_is_delete_story(false);
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
      {is_show_seen_by ? (
        <div className="seen_by_page">
          <div
            className="seen_by_cover"
            onClick={() => set_is_show_seen_by(false)}
          ></div>
          <div className="seen_by_user_container">
            <div className="seen_by_header">
              <IconSet.FaTimes
                className="cancle_icon"
                onClick={() => {
                  set_is_show_seen_by(false);
                }}
              ></IconSet.FaTimes>

              <h2>Seen your story</h2>
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
              {seen_users.map((item) => {
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
    </div>
  );
};

export default Story_page;
