import React from "react";
import "./Menu.css";
import Menu_Header from "./Menu_Header";
import Menu_Main from "./Menu_Main";
const Menu = (props) => {
  return (
    <div className="all_page_cover">
      <div
        className="black_cover"
        onClick={() => {
          props.callback();
        }}
      ></div>
      <div className="menu">
        <Menu_Header
          userdata={props.userdata}
          ip={props.ip}
          large_image={props.large_image}
        ></Menu_Header>
        <Menu_Main userdata={props.userdata} ip={props.ip}></Menu_Main>
      </div>
    </div>
  );
};

export default Menu;
