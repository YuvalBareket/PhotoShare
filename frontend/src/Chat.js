import React, { Component, useEffect, useRef, useState } from "react";
import "./Chat.css";
import axios from "axios";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Massege } from "./Massege";
import * as IconSet from "react-icons/fa";

const Chat = ({ socket, ip }) => {
  const history = useHistory();

  const location = useLocation();
  const chat_data = location.state;
  const chat_user_name = chat_data.other_user_name;
  const room = chat_data.room;
  const my_user_id = chat_data.user_id;
  const chat_user_id = chat_data.other_user_id;
  const [current_msg, set_current_msg] = useState("");
  const [all_msg, set_all_msg] = useState([]);
  const [how_many_users, set_how_many_users] = useState(0);
  const [is_connected, set_is_connected] = useState(chat_data.is_connected);
  const [is_large_image, set_is_large_image] = useState(false);

  const massegeRef = useRef(null);
  useEffect(() => {
    axios.post(`http://${ip}:8001/set_is_connected`, {
      user_id: my_user_id,
      is_connected: true,
    });
    massegeRef.current?.scrollIntoView();
  }, [all_msg]);
  socket.on(`set_user_${chat_user_id}_is_disconnected`, () => {
    set_is_connected(false);
  });
  socket.on(`set_user_${chat_user_id}_is_connected`, () => {
    set_is_connected(true);
  });
  socket.on(`everyone_in_the_chat_${room}`, () => {
    set_how_many_users(2);
    let newarray = [];
    all_msg.map((item) => {
      newarray.push({ ...item, is_seen: true });
    });

    set_all_msg(newarray);
    axios
      .post(`http://${ip}:8001/set_masseges`, { room })
      .then((response) => {
        if (response.status === 200) {
          console.log("set masseges sucsess");
        }
      })
      .catch((err) => console.log(err));
  });

  socket.on(`not_everyone_in_the_chat_${room}`, () => {
    set_how_many_users(1);
  });

  useEffect(() => {
    axios
      .post(`http://${ip}:8001/set_current_page`, {
        user_id: my_user_id,
        current_page: "Masseges",
      })
      .then((response) => {
        if (response.status === 200) {
        }
      })
      .catch((err) => console.log(err));
    if (location.state.massege_number > 0) {
      axios
        .post(`http://${ip}:8001/set_masseges`, { room })
        .then((response) => {
          if (response.status === 200) {
            console.log("set masseges sucsess");
          }
        })
        .catch((err) => console.log(err));
    }

    axios.post(`http://${ip}:8001/get_chat_date`, { room }).then((response) => {
      if (response.status === 200) {
        const date = response.data.date;
        const time = response.data.time;
        console.log(time);

        axios
          .post(`http://${ip}:8001/get_masseges`, { room, date, time })
          .then((response) => {
            if (response.status === 200) {
              let newarray = [];
              response.data.map((item) => {
                newarray.push({
                  data: {
                    room: room,
                    user_name: chat_user_name,
                    massege: item.massege,
                    time: item.time.substring(0, 5),
                    post_id: item.post_id,
                    story_id: item.story_id,
                    post_path: item.post_path,
                    story_path: item.story_path,
                    post_user_name: item.post_user_name,
                    post_profile_image: item.post_profile_image,
                    post_user_id: item.post_user_id,
                    post_user_followers: item.post_user_followers,
                    post_user_private:
                      item.post_user_private === 1 ? true : false,
                  },
                  is_recived: my_user_id !== item.user_id,
                  is_seen: item.is_read === 1 ? true : false,
                });
              });

              set_all_msg(newarray);
            } else console.log("failed getting masseges");
          })
          .catch((err) => console.log(err));
      }
    });
  }, []);

  const handleclick = async () => {
    const current_date = new Date();
    if (current_msg !== "") {
      console.log("send mas " + current_msg);

      const massegeData = {
        room: room,
        user_name: chat_user_name,
        massege: current_msg,
        time: current_date.getHours() + ":" + current_date.getMinutes(),
      };
      await socket.emit("send_msg", massegeData);

      axios
        .post(`http://${ip}:8001/insert_masseges`, {
          room,
          my_user_id,
          current_msg,
          is_read: how_many_users === 2,
          story_id: -1,
          post_id: -1,
        })
        .then((response) => {
          if (how_many_users !== 2) {
            const data = {
              recived_user: chat_user_id,
              send_user: my_user_id,
            };
            socket.emit(`massege_number_plus`, data);
          }

          if (response.status === 200) {
            set_all_msg((list) => [
              ...list,
              {
                data: massegeData,
                is_recived: false,
                is_seen: how_many_users === 2 ? true : false,
              },
            ]);

            console.log("insert masseges sucsess");
            set_current_msg("");
          }
          socket.emit("massege_send", room);
        })
        .catch((err) => console.log(err));
    }
  };

  useEffect(() => {
    socket.on("recive_msg", (data) => {
      console.log(data);

      set_all_msg((list) => [
        ...list,
        {
          data: data.data,
          is_recived: true,
          how_many_users: data.data.is_recived ? 2 : how_many_users,
        },
      ]);
    });
  }, [socket]);
  function handleBackPress() {
    history.push({
      pathname: "/Tweets",
      state: chat_data.userdata,
    });
  }
  return (
    <div className="chat_all_page">
      <div className="chat_head">
        <IconSet.FaArrowAltCircleLeft
          className="back_arrow"
          onClick={() => {
            handleBackPress();
          }}
        ></IconSet.FaArrowAltCircleLeft>
        <div
          className="profile_image"
          onClick={() => {
            set_is_large_image(true);
          }}
        >
          {location.state.profile_image === "null" ? (
            <IconSet.FaUserCircle className="profile_image"></IconSet.FaUserCircle>
          ) : (
            <img
              className="profile_image"
              src={`http://${ip}:8001/${location.state.profile_image}`}
              alt="profile"
            ></img>
          )}{" "}
          <div className={is_connected ? "connected" : "disconnected"}></div>
        </div>
        <h2
          onClick={() => {
            const userdata = {
              user_id: chat_user_id,
              is_me: chat_user_id === my_user_id,
              this_user_id: my_user_id,
            };
            history.push({
              pathname: "/Profile",
              state: userdata,
            });
          }}
        >
          {location.state.other_user_name}
        </h2>
      </div>

      <div className="chat_body">
        {all_msg.map((item, index) => {
          return (
            <Massege
              key={index}
              my_user_id={my_user_id}
              ip={ip}
              massege={item.data.massege}
              user_name={item.data.user_name}
              time={item.data.time}
              is_recived={item.is_recived}
              post_id={item.data.post_id}
              story_id={item.data.story_id}
              post_path={item.data.post_path}
              story_path={item.data.story_path}
              is_seen={
                item.is_seen ? true : how_many_users === 2 ? true : false
              }
              image_path={item.data.image_path}
              post_user_name={item.data.post_user_name}
              post_profile_image={item.data.post_profile_image}
              post_user_id={item.data.post_user_id}
              post_user_followers={item.data.post_user_followers}
              post_user_private={item.data.post_user_private}
            ></Massege>
          );
        })}
        <div ref={massegeRef}></div>
      </div>

      <div className="foot">
        <textarea
          placeholder="write..."
          onChange={(e) => {
            set_current_msg(e.target.value);
          }}
          value={current_msg}
        ></textarea>
        <button onClick={handleclick}>send</button>
      </div>

      {is_large_image ? (
        <div
          className="large_profile_image_container"
          onClick={() => {
            set_is_large_image(false);
          }}
        >
          <img
            className="large_profile_image"
            src={`http://${ip}:8001/${location.state.profile_image}`}
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
    </div>
  );
};

export default Chat;
