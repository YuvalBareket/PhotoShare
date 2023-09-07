import React, { useState } from "react";
import "./Switch_Btn.css";
import axios from "axios";

const Switch_Btn = (props) => {
  return (
    <div className="all_switch">
      <div
        className={
          props.is_active ? "btn_container active" : "btn_container not_active"
        }
        onClick={() => {
          props.handleState();
        }}
      >
        <div className="ball"></div>
      </div>
    </div>
  );
};

export default Switch_Btn;
