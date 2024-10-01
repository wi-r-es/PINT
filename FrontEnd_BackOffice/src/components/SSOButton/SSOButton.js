import React from "react";
import { Button } from "react-bootstrap";
import "./SSOButton.css";

const SSOButton = ({ text, icon }) => {
  return (
    <Button className="icon-button" variant="outline-primary">
      <img src={icon} alt="icon" className="icon-button-image" />
      <span className="icon-button-text">{text}</span>
    </Button>
  );
};


export default SSOButton;
