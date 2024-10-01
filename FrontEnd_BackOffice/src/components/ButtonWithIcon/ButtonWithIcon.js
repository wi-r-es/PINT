import React from "react";
import { Button } from "react-bootstrap";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./ButtonWithIcon.css";

const ButtonWithIcon = ({ icon, text, disabled = false, onClick }) => {
  return (
    <div className="center-custom-button">
      <Button
        className={`btn ${disabled ? "btn-secondary btn-secondary2" : "btn-custom"}`}
        onClick={onClick}
        disabled={disabled}
      >
        {text} <i className={icon}></i>
      </Button>
    </div>
  );
};

export default ButtonWithIcon;
