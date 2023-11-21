import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { userActions } from "../store/user/user-slice";
import { dropdown_data } from "./drop-down-data";

import List from "./List";
import "./Dropdown.css";

const Dropdown = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(userActions.logout());
    navigate("/signup", { replace: true });
  };

  const accountMenu = dropdown_data.find(
    (item) => item.head === "Your Account"
  );
  const listMenu = dropdown_data.find((item) => item.head === "Your Lists");

  const insertedLinks = (
    <div className="lists d-flex flex-row-reverse justify-content-between">
      <List
        onLogout={logoutHandler}
        onClose={props.onClose}
        listLinks={accountMenu}
      />
      <List onClose={props.onClose} listLinks={listMenu} />
    </div>
  );

  return <div className="dropdown">{insertedLinks}</div>;
};

export default Dropdown;
