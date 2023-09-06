import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import * as IconSet from "react-icons/fa";
import "./PhotoShare.css";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import Menu from "./Menu";
import { useHistory } from "react-router-dom";
import Story_page from "./Story_page";

const PhotoShare = (props) => {
  const [back_prass, set_back_prass] = useState(0);
  const location = useLocation();
  const [userdata, set_userdata] = useState(location.state);
  const [notifications, set_notifications] = useState(0);
  const [masseges, set_masseges] = useState(0);
  const [icon, set_icon] = useState("Home");
  const [is_menu_clicked, set_is_menu_cliicked] = useState(false);

  const [is_large_image, set_is_large_image] = useState(false);
  const [image, set_image] = useState("");
  const [show_story, set_show_story] = useState(false);

  const [stories, set_stories] = useState([]);
  const [first_unseen_story, set_first_unseen_story] = useState(0);
  const [is_home_clicked_twice, set_is_home_clicked_twice] = useState(false);
  const user_name = userdata.user_name;
  const history = useHistory();

  useEffect(() => {
    axios.post(`http://${props.ip}:8001/set_is_connected`, {
      user_id: userdata.user_id,
      is_connected: true,
    });
    props.socket.emit("user_id_after_login", userdata.user_id);
    props.socket.emit("leave_room", userdata.user_id);
    axios
      .post(`http://${props.ip}:8001/get_unseen_follow_requests`, {
        user_id: userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_notifications(response.data);
          axios
            .post(`http://${props.ip}:8001/get_unseen_alerts`, {
              user_id: userdata.user_id,
            })
            .then((res) => {
              if (res.status === 200) {
                set_notifications(response.data + res.data);
              }
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));

    axios
      .post(`http://${props.ip}:8001/get_unseen_masseges`, {
        user_id: userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          set_masseges(response.data);
        }
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/get_userdata`, {
        user_id: userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_userdata({ ...response.data, is_me: userdata.is_me });
          set_icon(response.data.current_page);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleIconPrass = (icon_name) => {
    axios
      .post(`http://${props.ip}:8001/set_current_page`, {
        user_id: userdata.user_id,
        current_page: icon_name,
      })
      .then((response) => {
        if (response.status === 200) {
          set_icon(icon_name);
        }
      })
      .catch((err) => console.log(err));
  };
  const handleHomePrass = () => {
    set_is_home_clicked_twice(true);
  };
  const handleMenuPrass = () => {
    set_is_menu_cliicked(true);
  };
  const handleExitMenu = () => {
    set_is_menu_cliicked(false);
  };

  const handle_show_story = (my_stories, first_unseen_story) => {
    set_first_unseen_story(first_unseen_story);
    set_stories(my_stories);
    if (my_stories.length > 0) set_show_story(true);
  };

  props.socket.on(`set_user_${userdata.user_id}_follow_request`, () => {
    set_notifications(notifications + 1);
  });
  props.socket.on(`set_user_${userdata.user_id}_alerts`, ({ alert_num }) => {
    set_notifications(notifications + alert_num);
  });

  props.socket.on(`new_massege_from_user_to_${userdata.user_id}`, () => {
    set_masseges(masseges + 1);
  });

  props.socket.on(`remove_user_${userdata.user_id}_follow_request`, () => {
    if (notifications > 0) set_notifications(notifications - 1);
  });
  const handlecallback = () => {
    set_notifications(0);
  };
  function handle_large_Image(image_path) {
    console.log(image_path);
    set_image(image_path);
    set_is_large_image(true);
  }

  return (
    <div className="all_page">
      <div className="tweets_header">
        <Header
          callback={handleMenuPrass}
          userdata={userdata}
          ip={props.ip}
        ></Header>
      </div>
      <div className="tweets_main">
        <Main
          icon={icon}
          ip={props.ip}
          userdata={userdata}
          notifications={notifications}
          masseges={masseges}
          socket={props.socket}
          callback={handlecallback}
          large_image={handle_large_Image}
          show_story={handle_show_story}
          is_home_clicked_twice={is_home_clicked_twice}
        ></Main>
      </div>
      {is_menu_clicked ? (
        <Menu
          callback={handleExitMenu}
          userdata={userdata}
          ip={props.ip}
          large_image={handle_large_Image}
        ></Menu>
      ) : (
        ""
      )}
      {is_large_image ? (
        <div
          className="large_profile_image_container"
          onClick={() => {
            set_is_large_image(false);
          }}
        >
          {image === "null" ? (
            <IconSet.FaUserCircle className="profile_image"></IconSet.FaUserCircle>
          ) : (
            <img
              className="large_profile_image"
              src={`http://${props.ip}:8001/${image}`}
              alt="profile"
            ></img>
          )}{" "}
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
      <div className="tweets_footer">
        <Footer
          callback_home={handleHomePrass}
          callback={handleIconPrass}
          icon={icon}
          notifications={notifications}
          masseges={masseges}
          socket={props.socket}
        ></Footer>
      </div>
      {show_story ? (
        <Story_page
          first_unseen_story={first_unseen_story}
          ip={props.ip}
          stories={stories}
          userdata={userdata}
          closestory={() => {
            set_show_story(false);
          }}
          socket={props.socket}
        ></Story_page>
      ) : (
        ""
      )}{" "}
    </div>
  );
};

export default PhotoShare;
