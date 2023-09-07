import React, { useEffect, useState } from "react";
import "./Chat_container.css";
import * as IconSet from "react-icons/fa";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Chat_container = (props) => {
  const history = useHistory();
  const [is_connected, set_is_connected] = useState(false);
  const [massege_number, set_massege_number] = useState(0);
  useState(massege_number);

  const [userdata, set_userdata] = useState({});
  const chat = props.chatdata;

  props.socket.on(
    `new_massege_from_user_${props.other_user_id}_to_${props.userdata.user_id}`,
    () => {
      set_massege_number(massege_number + 1);
    }
  );

  props.socket.on(`set_user_${props.other_user_id}_is_disconnected`, () => {
    set_is_connected(false);
  });
  props.socket.on(`set_user_${props.other_user_id}_is_connected`, () => {
    set_is_connected(true);
  });

  // useEffect(() => {
  //   axios
  //     .post(`http://${props.ip}:8001/get_userdata`, {
  //       user_id: props.other_user_id,
  //     })
  //     .then((response) => {
  //       if (response.status === 200) {
  //         set_userdata({ ...response.data });
  //         set_is_connected(response.data.is_connected);
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // }, []);

  useEffect(() => {
    axios
      .post(`http://${props.ip}:8001/get_is_connected`, {
        user_id: props.other_user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_is_connected(response.data === 0 ? false : true);
        } else console.log("failed getting masseges");
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/get_chat_date`, {
        room: chat.room,
      })
      .then((response) => {
        if (response.status === 200) {
          const date = response.data.date;

          axios
            .post(`http://${props.ip}:8001/get_massege_number`, {
              room: chat.room,
              other_user_id: props.other_user_id,
              date,
            })
            .then((response) => {
              if (response.status === 200) {
                set_massege_number(response.data);
              } else console.log("failed getting masseges");
            })
            .catch((err) => console.log(err));
        }
      });
  }, []);
  function handleClick() {
    props.socket.emit("join_room", chat.room);
    const chat_userdata = {
      user_id: props.userdata.user_id,
      user_name: props.user_name,
      room: chat.room,
      massege_number: massege_number,
      other_user_name: props.chatdata.user_name,
      other_user_id: props.other_user_id,
      profile_image: props.chatdata.profile_image,
      is_connected: is_connected,
      userdata: props.userdata,
    };
    history.push({
      pathname: "/Chat",
      state: chat_userdata,
    });
  }

  return (
    <div className="chat_container">
      <div className="chat_profile">
        <div className="profile_image">
          {props.chatdata.profile_image === "null" ? (
            <IconSet.FaUserCircle className="profile_image"></IconSet.FaUserCircle>
          ) : (
            <img
              onClick={() => props.large_image(props.chatdata.profile_image)}
              className="profile_image"
              src={`http://${props.ip}:8001/${props.chatdata.profile_image}`}
              alt="profile"
            ></img>
          )}{" "}
          <div className={is_connected ? "connected" : "disconnected"}></div>
        </div>
        <span
          className="chat_name"
          onClick={() => {
            handleClick();
          }}
        >
          {props.chatdata.user_name}
        </span>
      </div>
      {massege_number > 0 ? (
        <div className="massege_number">
          <span>{massege_number > "99" ? "99+" : massege_number}</span>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Chat_container;
