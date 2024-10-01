import React from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './UserComponent.css';

const UserComponent = ({ name, onClick }) => {
    return (
        <div className="user-component" onClick={onClick} style={{ cursor: "pointer" }}>
            <div className="user-icon">
                <i className="fas fa-user-circle"></i>
            </div>
            <div className="user-name">
                <p>{name}</p>
            </div>
        </div>
    );
}

export default UserComponent;
