import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./Sign_in.css";
const Sign_in = ({ ip }) => {
  const history = useHistory();

  const [username, setusername] = React.useState("");
  const [password, setpassword] = React.useState("");
  const [email, setemail] = useState("");
  function handleSubmit(event) {
    event.preventDefault();

    axios
      .post(`http://${ip}:8001/sign_in`, { username, password, email })
      .then((response) => {
        if (response.status === 200) {
          history.push({
            pathname: "/",
          });
        } else alert(`this user data is already registred in the system`);
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="page_container">
      <div className="data_container">
        <h1>Plaes sign in</h1>

        <form className="form_container" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="email"
            onChange={(e) => setemail(e.target.value)}
            required
          ></input>
          <input
            type="text"
            placeholder="username"
            onChange={(e) => setusername(e.target.value)}
            required
          ></input>

          <input
            type="password"
            placeholder="password"
            onChange={(e) => setpassword(e.target.value)}
            required
          ></input>

          <button>Sing in</button>
        </form>
      </div>
    </div>
  );
};

export default Sign_in;
