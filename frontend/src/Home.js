import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import Header from "./Header";
import Footer from "./Footer";
import Story from "./Stories";
import Suggests_for_you from "./Suggests_for_you";
import Stories from "./Stories";
import Post from "./Post";
import axios from "axios";
import { useHistory } from "react-router-dom";
import * as IconSet from "react-icons/fa";

const Home = (props) => {
  const history = useHistory();
  const [is_see_more, set_is_see_more] = useState(true);

  const [all_posts, set_all_posts] = useState([]);

  const load_data = async () => {
    axios
      .post(`http://${props.ip}:8001/get_all_posts`, {
        user_id: props.userdata.user_id,
        offset: all_posts.length,
      })
      .then((response) => {
        if (response.status === 200) {
          set_all_posts((prev) => [...prev, ...response.data]);
          if (response.data.length < 2) set_is_see_more(false);
        }
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    // axios
    //   .post(`http://${props.ip}:8001/set_current_page`, {
    //     user_id: props.userdata.user_id,
    //     current_page: "Home",
    //   })
    //   .then((response) => {
    //     if (response.status === 200) {
    //     }
    //   })
    //   .catch((err) => console.log(err));
    load_data();
  }, []);

  return (
    <div className="all_home">
      <Stories
        userdata={props.userdata}
        ip={props.ip}
        show_story={props.show_story}
        is_show_story={props.is_show_story}
        socket={props.socket}
      ></Stories>
      <div className="all_posts">
        {all_posts.map((item) => {
          return (
            <div key={item.post_id} className="home_post_container">
              <Post
                key={item.post_id}
                ip={props.ip}
                userdata={props.userdata}
                post_data={item}
                send_post={props.send_post}
                socket={props.socket}
              ></Post>
            </div>
          );
        })}
      </div>
      {all_posts.length === 0 ? (
        <Suggests_for_you
          user_id={props.userdata.user_id}
          ip={props.ip}
          socket={props.socket}
        ></Suggests_for_you>
      ) : (
        <div
          className="see_more"
          onClick={() => {
            load_data();
          }}
        >
          <span>{is_see_more ? "see more" : "there are no more posts"}</span>
          {is_see_more ? (
            <IconSet.FaRedoAlt className="see_more_icon"></IconSet.FaRedoAlt>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
