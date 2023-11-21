import React, { Fragment, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Container, Form } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";
import { Helmet } from "react-helmet-async";
import { useForm } from "../../util/hooks/use-form";
import { useNavigate } from "react-router-dom";
import { useHttp } from "../../util/hooks/use-http";

import { userActions } from "../../components/store/user/user-slice";
import { fetchCart } from "../../components/store/user/user-actions";
import { fetchProducts } from "../../components/store/product/product-actions";

import ResetPasswordForm from "../../components/Screens/ResetPasswordForm/ResetPasswordForm";
import Input from "../../components/UI/FormElements/Input";
import MessageBox from "../../components/UI/MessageBox/MessageBox";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_EXACTLENGTH,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../util/validators";

import "./Signup.css";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const { sendRequest, resetError, isLoading, error } = useHttp();
  const { formState, inputHandler, setFormData } = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const switchModeHandler = () => {
    if (isLoginMode) {
      resetError();
      setFormData(
        {
          ...formState.inputs,
          name: { value: "", isValid: false },
          confirmPassword: { value: "", isValid: false },
        },
        false
      );
    } else {
      resetError();
      setFormData(
        {
          email: {
            value: formState.inputs.email.value,
            isValid: formState.inputs.email.isValid,
          },
          password: {
            value: formState.inputs.password.value,
            isValid: formState.inputs.password.isValid,
          },
        },
        formState.inputs.email.isValid
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const switchResetModeHandler = () => {
    resetError();
    setIsResetMode((prevMode) => !prevMode);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (error) resetError();

    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/user/login`,
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          { "Content-Type": "application/json" }
        );

        dispatch(
          userActions.login({
            user: {
              name: responseData.name,
              email: responseData.email,
              passwordLength: responseData.passwordLength,
              address: responseData.address,
            },
            token: responseData.token,
          })
        );
        dispatch(fetchCart(responseData.token));
        dispatch(
          fetchProducts(
            `${process.env.REACT_APP_BACKEND_URL}/products/user`,
            false,
            true,
            responseData.token
          )
        );

        navigate("/", { replace: true });
      } catch (err) {}
    } else {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/user/signup`,
          "POST",
          JSON.stringify({
            name: formState.inputs.name.value,
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
            confirmPassword: formState.inputs.confirmPassword.value,
          }),
          { "Content-Type": "application/json" }
        );

        dispatch(
          userActions.login({
            user: {
              name: responseData.name,
              email: responseData.email,
              passwordLength: responseData.passwordLength,
              address: responseData.address,
            },
            token: responseData.token,
          })
        );
        dispatch(fetchCart(responseData.token));
        dispatch(
          fetchProducts(
            `${process.env.REACT_APP_BACKEND_URL}/products/user`,
            false,
            true,
            responseData.token
          )
        );

        navigate("/", { replace: true });
      } catch (err) {}
    }
  };

  return (
    <Fragment>
      <Helmet>
        <title>{isLoginMode ? "Login" : "Signup"}</title>
      </Helmet>
      <Container className="signup-contanier container-small">
        {error && (
          <MessageBox variant="danger">
            {
              <Fragment>
                <BsExclamationTriangle /> {error}
              </Fragment>
            }
          </MessageBox>
        )}
        {!isResetMode && (
          <h2 className="my-3">{isLoginMode ? "Sign In" : "Create Account"}</h2>
        )}
        <Form onSubmit={submitHandler}>
          {!isLoginMode && (
            <Input
              name="name"
              type="text"
              label="Name"
              onInput={inputHandler}
              validators={[VALIDATOR_REQUIRE()]}
              errorMessage="Enter your name"
              input={true}
            />
          )}
          {!isResetMode && (
            <Input
              name="email"
              type="email"
              label="Email"
              onInput={inputHandler}
              validators={[VALIDATOR_EMAIL()]}
              errorMessage="Enter your email"
              input={true}
            />
          )}
          {!isResetMode && (
            <Input
              name="password"
              type="password"
              label="Password"
              onInput={inputHandler}
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorMessage="Minimum 6 characters required"
              input={true}
            />
          )}
          {!isLoginMode && (
            <Input
              name="confirmPassword"
              type="password"
              label="Re-enter password"
              onInput={inputHandler}
              validators={[
                VALIDATOR_EXACTLENGTH(formState.inputs.password.value.length),
              ]}
              errorMessage=" Passwords must match"
              input={true}
            />
          )}
          {!isResetMode && (
            <div className="reset-container">
              {isLoginMode && (
                <button
                  type="button"
                  onClick={switchResetModeHandler}
                  className="return-btn mb-2"
                  disabled={isLoading}>
                  Forget Password?
                </button>
              )}
            </div>
          )}
          {!isResetMode && (
            <Button
              type="submit"
              className="px-3 py-1 add"
              disabled={!formState.isValid || isLoading}>
              Continue
            </Button>
          )}
        </Form>
        {isResetMode && (
          <ResetPasswordForm
            returnText="Switch To Login"
            onSwitch={switchResetModeHandler}
          />
        )}
        {!isResetMode && (
          <p className="mt-3">
            {isLoginMode ? "New to Amazon?" : "Already have an account?"}
            <Button
              type="button"
              variant="outline-secondary"
              className="px-3 py-1 ms-2"
              onClick={switchModeHandler}
              disabled={isLoading}>
              {!isLoginMode ? "Sign in" : "Create your Amazon account"}
            </Button>
          </p>
        )}
      </Container>
    </Fragment>
  );
};

export default Signup;
