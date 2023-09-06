import React, { useEffect, useState } from "react";
import axios, { all } from "axios";
import { useLocation } from "react-router-dom";

import { useHistory } from "react-router-dom";
import "./Login.css";

const Login = ({ socket, ip }) => {
  const history = useHistory();
  const location = useLocation();
  const [user_name, setuser_name] = React.useState("");
  const [password, setpassword] = React.useState("");

  useEffect(() => {
    socket.emit("set_user_to_home");
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    axios
      .post(`http://${ip}:8001/login`, { user_name, password })
      .then((response) => {
        if (response.status === 200) {
          const userdata = response.data;
          console.log(userdata);
          history.push({
            pathname: "/Tweets",
            state: { ...userdata, is_me: true },
          });
        } else alert("user is wrong");
      })
      .catch((err) => console.log(err));
  }
  return (
    <div className="page_container">
      <h1>Welcomt to PhotoShare</h1>
      <div className="data_container">
        <h1>Please log in</h1>
        <form onSubmit={handleSubmit} className="form_container">
          <input
            type="text"
            placeholder="user_name"
            onChange={(e) => setuser_name(e.target.value)}
            required
          ></input>

          <input
            type="password"
            placeholder="password"
            onChange={(e) => setpassword(e.target.value)}
            required
          ></input>

          <button>Login</button>
        </form>
        <div className="sign_in">
          Dont have an acount?{" "}
          <span
            className="sign_in_link"
            onClick={() => {
              history.push({
                pathname: "/Sign_in",
              });
            }}
          >
            click here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
