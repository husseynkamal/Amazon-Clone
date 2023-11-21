import React from "react";
import { Link } from "react-router-dom";

const List = (props) => {
  const insertedNavLinks = props.listLinks.lists.map((item) => {
    return (
      <li key={item.id} onClick={props.onClose}>
        {item.type ? (
          <button type={item.type} onClick={props.onLogout}>
            {item.title}
          </button>
        ) : (
          <Link to={item.path}>{item.title}</Link>
        )}
      </li>
    );
  });

  return (
    <div>
      <h6>{props.listLinks.head}</h6>
      <ul>{insertedNavLinks}</ul>
    </div>
  );
};

export default List;
