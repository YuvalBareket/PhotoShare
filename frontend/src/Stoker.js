import React, { useEffect, useState } from "react";
import "./Stoker_Alert.css";
import * as IconSet from "react-icons/fa";
import axios from "axios";

const Stoker = (props) => {
  const [unseen_alert_number, set_unseen_alert_nummber] = useState(0);
  const [stoker_counter, set_stoker_counter] = useState(0);
  const [daily_stoker_counter, daily_set_stoker_counter] = useState(0);

  useEffect(() => {
    console.log(props.all_alerts);
    let counter = 0;

    props.all_alerts.map((item) => {
      if (item.alert_id === props.stoker_data.user_id) {
        counter++;
      }
    });
    set_unseen_alert_nummber(counter);
    axios
      .post(`http://${props.ip}:8001/get_stoker_profiile_alert`, {
        user_id: props.stoker_data.user_id,
        my_user_id: props.userdata.user_id,
      })
      .then((response) => {
        const today = new Date();
        if (response.status === 200) {
          set_stoker_counter(response.data.length);
          let daily_counter = 0;
          response.data.map((item) => {
            let date = new Date(item.date);
            if (date.toDateString() === today.toDateString()) daily_counter++;
          });
          daily_set_stoker_counter(daily_counter);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  return (
    <div
      className={
        props.is_selected
          ? "stoker_container selected_stoker"
          : "stoker_container"
      }
    >
      <div className="stoker_header">
        <div className="user_data">
          {props.stoker_data.profile_image === "null" ? (
            <IconSet.FaUserCircle className="stoker_profile_user_image"></IconSet.FaUserCircle>
          ) : (
            <img
              className="stoker_profile_user_image"
              src={`http://${props.ip}:8001/${props.stoker_data.profile_image}`}
              alt="profile"
            ></img>
          )}{" "}
          <span>{props.stoker_data.user_name}</span>
        </div>
        {unseen_alert_number !== 0 ? (
          <div className="alerts_number">{unseen_alert_number}</div>
        ) : (
          ""
        )}
      </div>
      <div
        className="stoker_main"
        onClick={() => {
          props.select_stoker(props.index, props.stoker_data.user_id);
          set_unseen_alert_nummber(0);
        }}
      >
        <span>
          {props.stoker_data.user_name} looked at your profile {stoker_counter}{" "}
          times untill now
        </span>
        <span>
          {props.stoker_data.user_name} looked at your profile{" "}
          {daily_stoker_counter} times today
        </span>
        <span className="stoker_massege">
          {daily_stoker_counter === 0
            ? "mabey tommorow they will look at your profile"
            : `${
                daily_stoker_counter < 4
                  ? "wow it seems like someone has a crash on you"
                  : "OMG they are so obssesed with you"
              }`}
        </span>
      </div>
    </div>
  );
};

export default Stoker;
