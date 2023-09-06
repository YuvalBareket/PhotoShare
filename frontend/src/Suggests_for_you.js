import React, { useEffect, useState } from "react";
import Suggest from "./Suggest";
import axios from "axios";

import "./Suggest.css";
const Suggests_for_you = (props) => {
  const [suggests_array, set_suggests_array] = useState([]);
  useEffect(() => {
    axios
      .post(`http://${props.ip}:8001/get_suggests`, {
        this_user_id: props.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          set_suggests_array(response.data);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  const handle_follow = (user_id, is_private) => {
    if (is_private !== 0) {
      axios
        .post(`http://${props.ip}:8001/send_follow_request`, {
          this_user_id: props.user_id,
          other_user_id: user_id,
          is_follow_send: true,
        })
        .then((response) => {
          if (response.status === 200) {
            const other_user_id = user_id;

            props.socket.emit("send_follow_request", other_user_id);
            set_suggests_array(
              suggests_array.filter((item) => item.user_id !== user_id)
            );
          }
        })
        .catch((err) => console.log(err));
    }
  };
  return (
    <div>
      {suggests_array.length > 0 ? (
        <div className="suggest_users">
          <div className="for_you">Suggests for you</div>
          <div className="suggests">
            {suggests_array.map((item, index) => {
              return (
                <Suggest
                  key={index}
                  name={item.user_name}
                  profile_image={item.profile_image}
                  user_id={item.user_id}
                  my_user_id={props.user_id}
                  is_private={item.is_private}
                  ip={props.ip}
                  follow={handle_follow}
                ></Suggest>
              );
            })}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Suggests_for_you;
