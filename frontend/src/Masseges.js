import React, { useEffect, useState } from "react";
import "./Masseges.css";
import Header from "./Header";
import Footer from "./Footer";
import axios from "axios";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { useHistory } from "react-router-dom";

import * as IconSet from "react-icons/fa";
import Chat_container from "./Chat_container";

const Masseges = (props) => {
  const history = useHistory();

  const [all_chats, set_all_chats] = useState([]);
  const [search, set_search] = useState("");
  const [all_searched_chats, set_all_searched_chats] = useState([]);
  useEffect(() => {
    axios
      .post(`http://${props.ip}:8001/get_all_chats`, {
        user_id: props.userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          let newarray = [];
          response.data.map((item) => {
            newarray.push({ ...item });
          });
          set_all_searched_chats(newarray);
          set_all_chats(newarray);
        } else console.log("failed getting masseges");
      })
      .catch((err) => console.log(err));
  }, []);

  function handlechange(e) {
    console.log(e.target.value);
    if (e.target.value === "") set_all_searched_chats(all_chats);
    set_all_searched_chats(
      all_chats.filter((item) => item.user_name.includes(e.target.value))
    );
    set_search(e.target.value);
  }

  return (
    <div className="all_masseges_page">
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
      <div className="all_masseges">
        {all_searched_chats.map((chat) => {
          return (
            <div key={chat.chat_id}>
              <Chat_container
                key={chat.chat_id}
                other_user_id={chat.user_id}
                socket={props.socket}
                chatdata={chat}
                userdata={props.userdata}
                ip={props.ip}
                large_image={props.large_image}
              ></Chat_container>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Masseges;
