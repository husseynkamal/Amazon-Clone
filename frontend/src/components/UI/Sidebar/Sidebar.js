import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

import "./Sidebar.css";

const Sidebar = (props) => {
  const { user, isLoggedIn } = useSelector((state) => state.user);

  const firstUserName = user?.name?.split(" ")[0];

  const insertedList = props.categoriesList.map((list) => {
    return (
      <li key={list} onClick={props.onClick}>
        <Link
          to={`search?category=${list}`}
          className="d-block text-decoration-none text-capitalize">
          {list}
        </Link>
      </li>
    );
  });

  return (
    <div className={props.className}>
      <div className="d-flex align-items-center sidebar__header">
        <FaUserCircle />
        <h3>Hello, {isLoggedIn ? firstUserName : "User"}</h3>
      </div>
      <div className="sidebar__categories">
        <h4>Shop By Department</h4>
        <ul>{insertedList}</ul>
      </div>
    </div>
  );
};

export default Sidebar;
