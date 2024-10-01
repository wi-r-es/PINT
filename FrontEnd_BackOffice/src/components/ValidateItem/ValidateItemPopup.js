import React, { useState } from "react";
import "./ValidateItemPopup.css"; // Importing the CSS file for styling
import api from "../../api";
import Swal from "sweetalert2";
const ValidateItemPopup = ({ id, onClose, name, picture = null, email }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try{
            console.log('Validating user with id:', id);
            api.patch('/administration/validate-user',{
                user_id: id
            });

            Swal.fire({
                icon: 'success',
                title: 'User validated',
                showConfirmButton: false,
                timer: 1500
            });

            onClose();

        }catch(error){
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'An error occurred',
                text: error.response.data.message || 'Please try again later',
            });
        }

       
    };

    const handleReject = async () => {
        setIsSubmitting(true);
        try{
            api.patch('/administration/deactivate-user',{
                user_id: id
            });

            Swal.fire({
                icon: 'success',
                title: 'User deactivated',
                showConfirmButton: false,
                timer: 1500
            });

            onClose();

        }catch(error){
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'An error occurred',
                text: error.response.data.message || 'Please try again later',
            });
        }

    };

    return (
        <div className="popup-container">
            <div className="popup-content">
                <div className="popup-header">
                    <img src="./assets/grommet-icons_validate.svg" alt="" />
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <h2>Validate Item?</h2>
                <div className="user-info">
                    {picture ? (
                        <img src={picture} alt={name} className="user-picture" />
                    ) : (
                        <i className="fas fa-user-circle user-icon"></i>
                    )}
                    <div className="user-details">
                        <p>{name}</p>
                        <p>{email}</p>
                    </div>
                </div>
                {error && <p className="error">{error}</p>}
                <div className="popup-buttons">
                    <button className="popup-button cancel" onClick={handleReject} disabled={isSubmitting}>
                        Reject
                    </button>
                    <button className="popup-button validate" onClick={handleSubmit} disabled={isSubmitting}>
                        Validate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidateItemPopup;
