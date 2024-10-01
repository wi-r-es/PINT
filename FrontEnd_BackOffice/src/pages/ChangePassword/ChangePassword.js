import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const [route, setRoute] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const UpdatePasswd = async () => {
        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        try {
            console.log(token);
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}${route}`, 
                { password: newPassword },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.status === 200) {
                alert("Password reset successfully!");
                navigate("/login");
            } else {
                setErrorMessage("Failed to reset password. Please try again.");
            }
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        const storedRoute = localStorage.getItem("tempReset");
        if (storedRoute) {
            // Remove the first and last character of the route
            const trimmedRoute = storedRoute.slice(1, -1);
            setRoute(trimmedRoute);

            const urlParams = new URLSearchParams(trimmedRoute.split('?')[1]);
            const tokenValue = urlParams.get('token');
            setToken(tokenValue);
        }
    }, []);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h3 className="text-center mb-4">Reset Password</h3>
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group mt-3">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="btn btn-primary mt-4 w-100" onClick={UpdatePasswd}>
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
