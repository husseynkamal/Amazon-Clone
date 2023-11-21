import React, { Fragment, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Form } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";
import { FaRegQuestionCircle } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { Helmet } from "react-helmet-async";

import { useForm } from "../../util/hooks/use-form";
import { useHttp } from "../../util/hooks/use-http";

import { VALIDATOR_MINLENGTH } from "../../util/validators";
import { userActions } from "../../components/store/user/user-slice";
import Input from "../../components/UI/FormElements/Input";
import MessageBox from "../../components/UI/MessageBox/MessageBox";
import LoadingBox from "../../components/UI/LoadingBox/LoadingBox";
import Amazon from "../../assets/Amazon-Logo.png";

import "./NewPassword.css";

let HTTP_METHOD = "GET";

const NewPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sendRequest, isLoading, error } = useHttp();
  const { passwordToken } = useParams();
  const [userId, setUserId] = useState("");
  const { formState, inputHandler } = useForm(
    { password: { value: "", isValid: false } },
    false
  );
  const { isLoggedIn } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/user/password/reset/${passwordToken}`
        );

        setUserId(responseData.userId);
      } catch (err) {}
    };

    fetchUserId();
  }, [passwordToken, sendRequest]);

  const navigateToPath = isLoggedIn ? "/" : "/signup";

  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      HTTP_METHOD = "PATCH";
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/user/password/new`,
        HTTP_METHOD,
        JSON.stringify({
          newPassword: formState.inputs.password.value,
          userId,
          passwordToken,
        }),
        { "Content-Type": "application/json" }
      );

      HTTP_METHOD = "GET";
      dispatch(userActions.updatePassword(responseData.passwordLength));
      navigate(navigateToPath, { replace: true });
    } catch (err) {}
  };

  const isHttpGetError = error && HTTP_METHOD === "GET";
  const isHttpPatchError = error && HTTP_METHOD === "PATCH";

  if (isLoading) {
    return <LoadingBox />;
  }

  const insertedContent = isHttpGetError ? (
    <div className="text-center">
      <div className="img-container">
        <img src={Amazon} alt="Amazon Logo" />
      </div>
      <div className="content-error__container d-flex align-items-center text-start">
        <div>
          <FaRegQuestionCircle className="fs-1 question__icon" />
        </div>
        <div className="ms-3">
          <div>
            <p className="mb-0 ms-1 fs-5 fw-medium not-avail__paragraph">
              This page isn't available.
            </p>
            <p className="ms-1">
              We're sorry. The link you followed may be broken, or the page may
              have been removed.
            </p>
          </div>
          <div className="fs-5 fw-semibold">
            <IoMdArrowDropright /> Go to amazon.eg's{" "}
            <Link to={navigateToPath}>{isLoggedIn ? "Home" : "Sign In"}</Link>{" "}
            Page
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Fragment>
      <h2 className="my-3">Update Password</h2>
      <Form onSubmit={submitHandler}>
        <Input
          name="password"
          type="password"
          label="Password"
          onInput={inputHandler}
          validators={[VALIDATOR_MINLENGTH(6)]}
          errorMessage="Minimum 6 characters required"
          input={true}
        />
        <Button
          type="submit"
          className="px-3 py-1 add"
          disabled={!formState.isValid || isLoading}>
          Update
        </Button>
      </Form>
    </Fragment>
  );

  return (
    <Container className="reset-container container-small p-0">
      <Helmet>
        <title>Update Password</title>
      </Helmet>
      {isHttpPatchError && (
        <MessageBox variant="danger">
          {
            <Fragment>
              <BsExclamationTriangle /> {error}
            </Fragment>
          }
        </MessageBox>
      )}
      {insertedContent}
    </Container>
  );
};

export default NewPassword;
