import React, { useEffect, useState } from "react";
import "./Stoker_Alert.css";
import Stoker from "./Stoker";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";

import axios from "axios";
import * as IconSet from "react-icons/fa";
import Alert from "./Alert";
const Stoker_Alerts = (props) => {
  const location = useLocation();

  const [all_stokers, set_all_stokers] = useState([]);
  const [all_alerts, set_all_alerts] = useState([]);
  const [all_unseen_alerts, set_all_unseen_alerts] = useState(
    location.state.all_stoker_alerts
  );

  const [is_see_more, set_is_see_more] = useState(true);
  const [selected_id, set_selected_id] = useState(0);
  const load_data = async (user_id, offset) => {
    console.log(user_id);
    axios
      .post(`http://${props.ip}:8001/get_all_alerts`, {
        user_id: location.state.userdata.user_id,
        offset: offset,
        is_stoker_alert: true,
        alert_user_id: user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          if (user_id === selected_id)
            set_all_alerts((prev) => [...prev, ...response.data]);
          else set_all_alerts(response.data);

          if (response.data.length < 5) set_is_see_more(false);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    axios
      .post(`http://${props.ip}:8001/get_all_unseen_stoker_alert`, {
        user_id: location.state.userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_all_unseen_alerts(response.data);
        }
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/get_stokers`, {
        stokers_id: location.state.userdata.stoke_mode,
      })
      .then((response) => {
        if (response.status === 200) {
          set_selected_id(response.data[0].user_id);
          console.log(response.data[0]);
          let stoker_array = [];
          for (let i = 1; i <= response.data.length; i++) {
            stoker_array.push({
              profile_image: response.data[i - 1].profile_image,
              user_id: response.data[i - 1].user_id,
              user_name: response.data[i - 1].user_name,
              index: i - 1,
              is_selected: i === 1,
            });
          }
          load_data(response.data[0].user_id, 0);
          set_all_stokers(stoker_array);
        }
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/set_all_stokers_alerts_to_seen`, {
        user_id: location.state.userdata.user_id,
        alert_user_id: selected_id,
      })
      .then((response) => {
        if (response.status === 200) {
          all_unseen_alerts.filter((item) => item.alert_id === selected_id);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  const handle_select = (selected_index, user_id) => {
    let stoker_array = [];
    all_stokers.map((item) => {
      if (item.index === selected_index)
        stoker_array.push({ ...item, is_selected: true });
      else stoker_array.push({ ...item, is_selected: false });
    });
    set_all_stokers(stoker_array);
    load_data(user_id, 0);
    set_selected_id(user_id);
    axios
      .post(`http://${props.ip}:8001/set_all_stokers_alerts_to_seen`, {
        user_id: location.state.userdata.user_id,
        alert_user_id: user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          all_unseen_alerts.filter((item) => item.alert_id === user_id);
        }
      })
      .catch((err) => console.log(err));
    set_is_see_more(true);
  };

  return (
    <div className="stoker_alerts_page">
      <div></div>
      <div className="stokers_main">
        <h1>Lets see who obssesed with you</h1>
        <div className="stokers_container">
          <h2>your chosen stalkers</h2>
          <div className="stokers_data">
            {all_stokers.map((item, index) => {
              return (
                <Stoker
                  key={item.user_id}
                  stoker_data={item}
                  is_selected={item.is_selected}
                  index={item.index}
                  select_stoker={handle_select}
                  userdata={location.state.userdata}
                  ip={props.ip}
                  all_alerts={all_unseen_alerts}
                ></Stoker>
              );
            })}
          </div>
        </div>
      </div>

      <div className="all_stokers_alerts">
        {all_alerts.map((item, index) => {
          return (
            <Alert
              ip={props.ip}
              key={index}
              alert_data={item}
              userdata={location.state.userdata}
            ></Alert>
          );
        })}
        {all_alerts.length === 0 ? (
          <span className="no_alerts">There are no alrts...</span>
        ) : (
          ""
        )}
      </div>

      {all_alerts.length === 0 ? (
        ""
      ) : (
        <div
          className="see_more"
          onClick={() => {
            load_data(selected_id, all_alerts.length);
          }}
        >
          <span>{is_see_more ? "see more" : "there are no more alerts"}</span>
          {is_see_more ? (
            <IconSet.FaRedoAlt className="see_more_icon"></IconSet.FaRedoAlt>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};

export default Stoker_Alerts;
