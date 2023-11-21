import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import AccountItem from "./AccountItem";
import ResetPasswordForm from "../../components/Screens/ResetPasswordForm/ResetPasswordForm";

import "./Account.css";

const Account = () => {
  const [passwordIsEdit, setPasswordIsEdit] = useState(false);
  const [content, setContent] = useState();
  const { user } = useSelector((state) => state.user);

  const switchModeHandler = () => {
    setPasswordIsEdit((prevEdit) => !prevEdit);
  };

  useEffect(() => {
    if (!passwordIsEdit) {
      setContent(
        <Fragment>
          <h2 className="text-center">Login &amp; Security</h2>
          <div className="account m-auto rounded">
            <AccountItem type="Name" title={user.name} />
            <AccountItem type="Email" title={user.email} />
            <AccountItem
              onEdit={switchModeHandler}
              type="Password"
              title={user.passwordLength}
            />
          </div>
        </Fragment>
      );
    } else {
      setContent(
        <ResetPasswordForm
          returnText="Account Settings"
          onSwitch={switchModeHandler}
        />
      );
    }
  }, [passwordIsEdit, user.name, user.email, user.passwordLength]);

  return (
    <Fragment>
      <Helmet>
        <title>Login &amp; Security</title>
      </Helmet>
      {content}
    </Fragment>
  );
};

export default Account;
