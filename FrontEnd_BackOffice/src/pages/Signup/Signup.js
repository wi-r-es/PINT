import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Authentication from "../../Auth.service";
import "./SignUp.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isFirstNameInvalid, setIsFirstNameInvalid] = useState(false);
  const [isLastNameInvalid, setIsLastNameInvalid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SoftShares - SignUp";
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for empty fields and invalid names
    setIsEmailEmpty(email === "");
    setIsFirstNameInvalid(firstName === "" || /\d/.test(firstName));
    setIsLastNameInvalid(lastName === "" || /\d/.test(lastName));

    // Show an alert if any field is empty or invalid
    if (
      email === "" ||
      firstName === "" ||
      lastName === "" ||
      /\d/.test(firstName) ||
      /\d/.test(lastName)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Fields",
        text: "Please fill in all fields correctly. Names should not include numbers.",
      });
      return;
    }

    // Save user data and navigate
    localStorage.setItem("user", JSON.stringify({ email, firstName, lastName }));
    navigate("/selectcity");
  };

  return (
    <div className="signup">
      <div className="softshares-container">
        <h1 className="softshares1">
          <span className="softshares-txt">
            <span>Soft</span>
            <span className="shares1">Shares</span>
          </span>
        </h1>
      </div>
      <div className="rectangle-parent">
        <div className="sign-up-wrapper">
          <h1 className="sign-up">Sign Up</h1>
        </div>

        <div className="frame-container">
          <div className="frame-div">
            <div className="frame-parent1">
              <Form className="input2" onSubmit={handleSubmit}>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value !== "") setIsEmailEmpty(false);
                  }}
                  className={isEmailEmpty ? "is-invalid" : ""}
                />
              </Form>
            </div>
          </div>
          <Form className="parent">
            <Form.Control
              type="text"
              placeholder="FirstName"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (e.target.value !== "" && !/\d/.test(e.target.value)) {
                  setIsFirstNameInvalid(false);
                }
              }}
              className={isFirstNameInvalid ? "is-invalid" : ""}
            />
          </Form>
          <Form className="parent">
            <Form.Control
              type="text"
              placeholder="LastName"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (e.target.value !== "" && !/\d/.test(e.target.value)) {
                  setIsLastNameInvalid(false);
                }
              }}
              className={isLastNameInvalid ? "is-invalid" : ""}
            />
          </Form>
          <div className="component-3-wrapper">
            <a className="component-3" href="/login">
              Already have an account?
            </a>
          </div>
          <div className="frame-wrapper1">
            <div className="frame-parent3">
              <div className="rectangle-wrapper2">
                <Form.Check className="rectangle-formcheck" label="" />
              </div>
              <div className="i-agree-with">
                I agree with the terms of service
              </div>
            </div>
          </div>
          <div className="frame-wrapper2">
            <div className="frame-parent4">
              <div className="rectangle-wrapper3">
                <Form.Check className="rectangle-formcheck1" label="" />
              </div>
              <div className="i-agree-with1">I agree with the privacy policy</div>
            </div>
          </div>
          <div className="frame-wrapper3">
            <div className="rectangle-group">
              <Button
                className="w-100 login-button"
                variant="primary"
                onClick={handleSubmit}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
