import React from "react";

import "./AccountItem.css";

const AccountItem = ({ type, title, onEdit }) => {
  const encryptedPassword = "*".repeat(title);

  return (
    <div className="account-item p-3 pb-3">
      <p className="d-flex justify-content-between mb-0">
        <strong>{type}</strong>
        {type === "Password" && <button onClick={onEdit}>Edit</button>}
      </p>
      <p>{type === "Password" ? encryptedPassword : title}</p>
    </div>
  );
};

export default AccountItem;
