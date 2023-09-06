import React, { useState } from "react";
import "./Search.css";
import Header from "./Header";
import * as IconSet from "react-icons/fa";
import axios from "axios";
import { useHistory } from "react-router-dom";

import Footer from "./Footer";
import Suggests_for_you from "./Suggests_for_you";
const Search = (props) => {
  const history = useHistory();

  const [searched_user_array, set_searched_user_array] = useState([,]);
  const [search, set_search] = useState("");
  function handleSearch(data) {
    if (data.length > 0) {
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
    } else {
      set_searched_user_array([]);
    }
  }
  const handleClick = (item) => {
    const userdata = {
      ...item,
      is_me: item.user_id === props.userdata.user_id,
      this_user_id: props.userdata.user_id,
    };
    history.push({
      pathname: "/Profile",
      state: userdata,
    });
  };
  function handlechange(e) {
    handleSearch(e.target.value);
    set_search(e.target.value);
  }

  return (
    <div className="search_page">
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
      <div className="searched_results">
        {searched_user_array.length === 0 && search !== ""
          ? "there are no such users..."
          : searched_user_array.map((item) => {
              return (
                <div
                  className="searched_user"
                  key={item.user_id}
                  onClick={() => handleClick(item)}
                >
                  {item.user_name}
                </div>
              );
            })}
      </div>
      {search === "" ? (
        <div>
          <Suggests_for_you
            user_id={props.userdata.user_id}
            ip={props.ip}
            socket={props.socket}
          ></Suggests_for_you>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Search;
