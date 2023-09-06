import React, { useEffect, useState } from "react";
import "./Follow_Request.css";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import * as IconSet from "react-icons/fa";
import axios from "axios";
import { useHistory } from "react-router-dom";
import Suggests_for_you from "./Suggests_for_you";

const Follow_Request = (props) => {
  const history = useHistory();

  const location = useLocation();
  const user_id = location.state.user_id;
  const [searched_users, set_searched_users] = useState([]);
  const [all_requests, set_all_requests] = useState([]);
  useEffect(() => {
    axios.post(`http://${props.ip}:8001/set_is_connected`, {
      user_id: user_id,
      is_connected: true,
    });
    axios
      .post(`http://${props.ip}:8001/get_all_follow_requests`, {
        user_id: user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_all_requests(response.data);
          set_searched_users(response.data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  function handleSearch() {}
  function handleClick(request_user_id) {
    axios
      .post(`http://${props.ip}:8001/get_userdata`, {
        user_id: request_user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          const userdata = {
            ...response.data,
            is_me: false,
            this_user_id: user_id,
          };
          history.push({
            pathname: "/Profile",
            state: userdata,
          });
        }
      })
      .catch((err) => console.log(err));
  }
  function handleAccept(request_user_id, req_id) {
    axios
      .post(`http://${props.ip}:8001/set_new_follow`, {
        request_user_id: request_user_id,
        recived_user_id: user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log("follow added");
          axios
            .post(`http://${props.ip}:8001/send_follow_request`, {
              this_user_id: request_user_id,
              other_user_id: user_id,
              is_follow_send: false,
              this_user_name: "",
            })
            .then((response) => {
              if (response.status === 200) {
                const new_array = all_requests.filter(
                  (item) => item.req_id !== req_id
                );
                set_all_requests(new_array);
                set_searched_users(new_array);
              }
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
  function handleRemove(request_user_id, req_id) {
    axios
      .post(`http://${props.ip}:8001/send_follow_request`, {
        this_user_id: request_user_id,
        other_user_id: user_id,
        is_follow_send: false,
        this_user_name: "",
      })
      .then((response) => {
        if (response.status === 200) {
          const new_array = all_requests.filter(
            (item) => item.req_id !== req_id
          );
          set_all_requests(new_array);
          set_searched_users(new_array);
        }
      })
      .catch((err) => console.log(err));
  }
  function handlechange(e) {
    if (e.target.value === "") set_searched_users(all_requests);
    set_searched_users(
      all_requests.filter((item) =>
        item.request_user_name.includes(e.target.value)
      )
    );
  }
  return (
    <div className="all_requests_page">
      <div className="search_bubble">
        <input
          type="text"
          placeholder="search..."
          onChange={(e) => {
            handlechange(e);
          }}
        ></input>
        <button onClick={handleSearch}>
          <IconSet.FaSearch></IconSet.FaSearch>
        </button>
      </div>
      <div className="all_rquests_container">
        <div className="only_the_requests">
          {searched_users.length > 0
            ? searched_users.map((item) => {
                return (
                  <div
                    className="follow_request"
                    key={item.req_id}
                    user_id={item.request_user}
                  >
                    <div
                      className="story_page_user_data"
                      onClick={() => {
                        const userdata = {
                          user_id: item.request_user,
                          is_me: user_id === item.user_id,
                          this_user_id: user_id,
                        };
                        history.push({
                          pathname: "/Profile",
                          state: userdata,
                        });
                      }}
                    >
                      <div className="story_user_image_container">
                        {item.profile_image === "null" ? (
                          <IconSet.FaUserCircle className="story_profile_user_image"></IconSet.FaUserCircle>
                        ) : (
                          <img
                            className="story_profile_user_image"
                            src={`http://${props.ip}:8001/${item.profile_image}`}
                            alt="profile"
                          ></img>
                        )}{" "}
                      </div>
                      <span>{item.user_name}</span>
                    </div>
                    <div className="buttons" item={item}>
                      <button
                        className="accept"
                        onClick={() =>
                          handleAccept(item.request_user, item.req_id)
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="remove"
                        onClick={() =>
                          handleRemove(item.request_user, item.req_id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            : "there are no requests"}
        </div>
        <div className="sugg">
          <Suggests_for_you
            user_id={user_id}
            ip={props.ip}
            socket={props.socket}
          ></Suggests_for_you>
        </div>
      </div>
    </div>
  );
};

export default Follow_Request;
