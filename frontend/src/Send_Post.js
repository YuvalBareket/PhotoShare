import React, { useEffect, useState } from "react";
import "./Send_Post.css";
import axios from "axios";
import * as IconSet from "react-icons/fa";
import User_Bubble from "./User_Bubble";

const Send_Post = (props) => {
  const [searched_user_array, set_searched_user_array] = useState([,]);
  const [search, set_search] = useState("");
  const [repeat, set_reapet] = useState("");

  const [selected_users, set_selected_users] = useState([]);
  useEffect(() => {
    axios
      .post(`http://${props.ip}:8001/get_searched_users`, {
        user_name: "",
        my_user_id: props.userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          let newarray = [];
          response.data.map((item) => {
            newarray.push({ ...item });
          });
          set_searched_user_array(newarray);
          console.log(newarray);
        } else console.log("failed getting masseges");
      })
      .catch((err) => console.log(err));
  }, []);
  function handleSearch(data) {
    axios
      .post(`http://${props.ip}:8001/get_searched_users`, {
        user_name: data,
        my_user_id: props.userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          let newarray = [];

          response.data.map((item) => {
            newarray.push({ ...item });
          });

          set_searched_user_array(newarray);
          console.log(newarray);
        } else console.log("failed getting masseges");
      })
      .catch((err) => console.log(err));
  }
  function handlechange(e) {
    handleSearch(e.target.value);
    set_search(e.target.value);
  }
  function handleSelect(user_id, room) {
    const index = selected_users.findIndex((item) => item.user_id === user_id);
    if (index !== -1) {
      const new_array = selected_users.filter(
        (item) => item.user_id !== user_id
      );
      set_selected_users(new_array);
    } else {
      set_selected_users((prev) => [...prev, { user_id, room }]);
    }
    console.log(selected_users);
  }
  const handleclick = async () => {
    const current_date = new Date();

    selected_users.map((item) => {
      const massegeData = {
        room: item.room,
        post_user_name: props.user_name,
        post_profile_image: props.profile_image,
        massege: repeat,
        time: current_date.getHours() + ":" + current_date.getMinutes(),
        image_path: props.image_path,
        post_id: props.post_id,
        post_user_followers: props.followers_id,
        post_user_private: props.is_private,
        post_user_id: props.post_user_id,
        post_path: props.image_path,
      };

      axios
        .post(`http://${props.ip}:8001/insert_masseges`, {
          room: item.room,
          my_user_id: props.userdata.user_id,
          current_msg: repeat,
          is_read: false,
          story_id: -1,
          post_id: props.post_id,
        })
        .then((response) => {
          const data = {
            recived_user: item.user_id,
            send_user: props.userdata.user_id,
          };
          props.socket.emit(`massege_number_plus`, data);

          if (response.status === 200) {
            props.socket.emit("send_msg", massegeData);

            console.log("insert masseges sucsess");
            set_reapet("");
            props.send_post(-1, "", true);
          }
          props.socket.emit("massege_send", 2);
        })
        .catch((err) => console.log(err));
    });
  };

  return (
    <div className="send_post">
      <div className="send_post_header">
        {" "}
        <div className="search_bubble">
          <input
            type="text"
            placeholder="search..."
            onChange={(e) => {
              handlechange(e);
              console.log(e.target.value);
            }}
          ></input>
          <button onClick={handleSearch}>
            <IconSet.FaSearch></IconSet.FaSearch>
          </button>
        </div>
      </div>
      <div className="send_post_main">
        <div className="sliding_users">
          {searched_user_array.map((item) => {
            return (
              <User_Bubble
                key={item.user_id}
                user_id={item.user_id}
                profile_image={item.profile_image}
                user_name={item.user_name}
                ip={props.ip}
                select_user={handleSelect}
                room={item.room}
              ></User_Bubble>
            );
          })}
        </div>
      </div>
      <div className="send_post_footer">
        <input
          type="text"
          placeholder={`write something...`}
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
    </div>
  );
};

export default Send_Post;
