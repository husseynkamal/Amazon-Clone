import React, { Fragment, useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";
import { GrReturn } from "react-icons/gr";
import { IoMdDoneAll } from "react-icons/io";

import { useForm } from "../../../util/hooks/use-form";
import { useHttp } from "../../../util/hooks/use-http";
import { encrypteEmail } from "../../../util/encrypt-email";

import { VALIDATOR_EMAIL } from "../../../util/validators";
import Input from "../../UI/FormElements/Input";
import MessageBox from "../../UI/MessageBox/MessageBox";

import "./ResetPasswordForm.css";

const ResetPasswordForm = ({ returnText, onSwitch }) => {
  const { sendRequest, isLoading, error, resetError } = useHttp();
  const [emailIsSent, setEmailIsSent] = useState(false);
  const { formState, inputHandler } = useForm(
    { email: { value: "", isValid: false } },
    false
  );

  useEffect(() => {
    if (emailIsSent) {
      setTimeout(() => {
        setEmailIsSent(false);
      }, 10000);
    }
  }, [emailIsSent]);

  const submitHandler = async (event) => {
    event.preventDefault();
    if (error) resetError();

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/user/reset`,
        "PUT",
        JSON.stringify({ email: formState.inputs.email.value }),
        { "Content-Type": "application/json" }
      );

      setEmailIsSent(true);
    } catch (err) {}
  };

  const encryptedEmail = encrypteEmail(formState.inputs.email.value);

  return (
    <Container className="reset-container container-small p-0">
      {error && (
        <MessageBox variant="danger">
          {
            <Fragment>
              <BsExclamationTriangle /> {error}
            </Fragment>
          }
        </MessageBox>
      )}
      {!emailIsSent && (
        <Fragment>
          <h2 className="my-3">Reset Password</h2>
          <Form onSubmit={submitHandler}>
            <Input
              name="email"
              type="email"
              label="Email"
              onInput={inputHandler}
              validators={[VALIDATOR_EMAIL()]}
              errorMessage="Enter your email"
              input={true}
            />
            <Button
              type="submit"
              className="px-3 py-1 add"
              disabled={!formState.isValid || isLoading}>
              Reset
            </Button>
          </Form>
          <button
            type="button"
            className="return-button mt-3 p-1"
            onClick={onSwitch}
            disabled={isLoading}>
            {returnText} <GrReturn />
          </button>
        </Fragment>
      )}
      {emailIsSent && (
        <div className="py-3 px-2 border border-primary rounded">
          <h3>
            Done <IoMdDoneAll />
          </h3>
          <p>
            We sent to you an email to{" "}
            <span className="encrypted-email">{encryptedEmail}</span> to reset
            your amazon's password
          </p>
        </div>
      )}
    </Container>
  );
};

export default ResetPasswordForm;
