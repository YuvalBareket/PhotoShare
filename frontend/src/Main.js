import React from "react";
import "./Main.css";
import Home from "./Home";
import Masseges from "./Masseges";
import Search from "./Search";
import Notifications from "./Notifications";
import NewPost from "./NewPost";

const Main = (props) => {
  return (
    <div className="main_container">
      {props.icon === "Home" || props.icon === "Profile" ? (
        <Home
          ip={props.ip}
          userdata={props.userdata}
          show_story={props.show_story}
          socket={props.socket}
          send_post={props.send_post}
        ></Home>
      ) : (
        ""
      )}
      {props.icon === "Masseges" ? (
        <Masseges
          ip={props.ip}
          userdata={props.userdata}
          masseges={props.masseges}
          socket={props.socket}
          large_image={props.large_image}
        ></Masseges>
      ) : (
        ""
      )}
      {props.icon === "NewPost" ? (
        <NewPost
          ip={props.ip}
          userdata={props.userdata}
          socket={props.socket}
        ></NewPost>
      ) : (
        ""
      )}
      {props.icon === "Search" ? (
        <Search
          ip={props.ip}
          userdata={props.userdata}
          socket={props.socket}
        ></Search>
      ) : (
        ""
      )}
      {props.icon === "Notifications" ? (
        <Notifications
          ip={props.ip}
          userdata={props.userdata}
          notifications={props.notifications}
          socket={props.socket}
          callback={props.callback}
        ></Notifications>
      ) : (
        ""
      )}
    </div>
  );
};

export default Main;
