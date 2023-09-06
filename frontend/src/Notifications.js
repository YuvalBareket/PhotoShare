import React, { useEffect, useRef, useState } from "react";
import "./Notifications.css";
import Header from "./Header";
import Footer from "./Footer";
import Alert from "./Alert";
import axios from "axios";
import * as IconSet from "react-icons/fa";

import { useHistory } from "react-router-dom";

const Notifications = (props) => {
  const history = useHistory();

  const [all_requests, set_all_requests] = useState(props.notifications);
  const [all_alerts, set_all_alerts] = useState([]);
  const [is_see_more, set_is_see_more] = useState(true);
  const [stoker_alerts, set_stoker_alerts] = useState([]);

  const load_data = async () => {
    axios
      .post(`http://${props.ip}:8001/get_all_alerts`, {
        user_id: props.userdata.user_id,
        offset: all_alerts.length,
        is_stoker_alert: false,
      })
      .then((response) => {
        if (response.status === 200) {
          set_all_alerts((prev) => [...prev, ...response.data]);
          if (response.data.length < 5) set_is_see_more(false);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    load_data();
    axios
      .post(`http://${props.ip}:8001/get_all_follow_requests`, {
        user_id: props.userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_all_requests(response.data.length);
        }
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/get_all_unseen_stoker_alert`, {
        user_id: props.userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          set_stoker_alerts(response.data);
        }
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/set_all_follow_requests_to_seen`, {
        user_id: props.userdata.user_id,
      })
      .then((response) => {
        if (response.status === 200) {
          props.callback();
        }
      })
      .catch((err) => console.log(err));
    axios
      .post(`http://${props.ip}:8001/set_all_alerts_to_seen`, {
        user_id: props.userdata.user_id,
        is_stoker_alert: false,
      })
      .then((response) => {
        if (response.status === 200) {
          props.callback();
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="all_noti_page">
      <div
        className="new_follow"
        onClick={() => {
          history.push({
            pathname: "/Follow_Requests",
            state: { user_id: props.userdata.user_id },
          });
        }}
      >
        {all_requests} new follow requests
      </div>
      <div className="all_alerts">
        <h2>All alerts</h2>
        <div
          className="stoker_alerts"
          onClick={() => {
            history.push({
              pathname: "/Stoker_Alerts",
              state: {
                userdata: props.userdata,
                all_stoker_alerts: stoker_alerts,
              },
            });
          }}
        >
          {stoker_alerts.length} new stoker alerts
        </div>
        {all_alerts.length === 0 ? (
          <div className="no_alerts">There are no alerts...</div>
        ) : (
          all_alerts.map((item, index) => {
            return (
              <Alert
                ip={props.ip}
                key={index}
                alert_data={item}
                userdata={props.userdata}
              ></Alert>
            );
          })
        )}
      </div>
      {all_alerts.length === 0 ? (
        ""
      ) : (
        <div
          className="see_more"
          onClick={() => {
            load_data();
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

export default Notifications;
