import React, { useEffect, useRef, useState } from "react";
import "./Show_Post.css";
import Post from "./Post";
import { useLocation } from "react-router-dom";

const Show_Post = (props) => {
  const location = useLocation();
  console.log(location.state);
  const [is_space, set_space] = useState(true);
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  return (
    <div className="show_post_page">
      {location.state.post_array.map((item) => {
        return (
          <div className={is_space ? "space" : ""}>
            <Post
              comment_id={location.state.comment_id}
              socket={props.socket}
              ip={props.ip}
              post_data={item}
              userdata={location.state.userdata}
              reff={
                item.post_id === location.state.post_data.post_id ? ref : null
              }
            ></Post>
          </div>
        );
      })}
    </div>
  );
};

export default Show_Post;
