import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./UsersTable.css";
import api from "../../api";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

const UsersTable = ({ token, user }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [isEditingOffice, setIsEditingOffice] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [userStatus, setUserStatus] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await api.get("/dynamic/get-users");
        const filteredUsers = response.data.data.filter(
          (user) => user.city !== "ALL"
        );
        console.log(filteredUsers);
        if (user.office_id !== 0) {
          setUsers(
            filteredUsers.filter(
              (user2) =>
                user2.office_id === user.office_id &&
                user2.hashed_password !== null
            )
          );
        } else {
          setUsers(
            filteredUsers.filter((user) => user.hashed_password !== null)
          );
        }
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
      }
    };

    const getOffices = async () => {
      try {
        const response = await api.get("/administration/get-all-centers");
        const filteredOffices = response.data.data.filter(
          (office) => office.city !== "ALL"
        );
        setOffices(filteredOffices);
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
      }
    };

    if (token) {
      getUsers();
      getOffices();
    }
  }, [refresh, token, user.office_id]);

  const filteredUsers = users.filter((user) =>
    (user.first_name + " " + user.last_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setSelectedOffice(user.office_id);
    setUserStatus(user.is_active ? "Activate" : "Inactivate");
    setNewPassword("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setIsEditingOffice(false);
    setIsEditingStatus(false);
    setIsEditingPassword(false);
  };

  const updateOffice = async () => {
    try {
      await api.post("/dynamic/update-user-office", {
        user_id: selectedUser.user_id,
        office_id: selectedOffice,
      });
      setUsers(
        users.map((user) =>
          user.user_id === selectedUser.user_id
            ? { ...user, office_id: selectedOffice }
            : user
        )
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Office updated successfully",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response.data.message,
      });
      console.error(err.response ? err.response.data : err.message);
    }
  };

  const updateUser = async () => {
    try {
      const status = userStatus === "Activate";
      await api.put("/user/update-acc-status", {
        user_id: selectedUser.user_id,
        status: status,
      });

      setUsers(
        users.map((user) =>
          user.user_id === selectedUser.user_id
            ? { ...user, is_active: status }
            : user
        )
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User status updated successfully",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response.data.message,
      });
      console.error(err.response ? err.response.data : err.message);
    }
  };

  const updatePasswd = async () => {
    try {
      await api.patch("/user/update-user-password", {
        user: selectedUser.user_id,
        password: newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Password updated successfully",
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response.data.message,
      });
      console.error(err.response ? err.response.data : err.message);
    }
  };

  const handleSaveChanges = async () => {
    if (selectedUser) {
      if (isEditingOffice) {
        await updateOffice();
      }
      if (isEditingStatus) {
        await updateUser();
      }
      if (isEditingPassword) {
        await updatePasswd();
      }
      setRefresh(!refresh);
    }
    handleCloseModal();
  };

  return (
    <div>
      <div
        className="card"
        style={{ width: "22rem", borderColor: "#00BFFF", borderWidth: "1px" }}
      >
        <input
          type="text"
          placeholder="Search users"
          className="form-control mb-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div
          className="list-group list-group-flush"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {filteredUsers.map((user, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              onClick={() => handleShowModal(user)}
              style={{ cursor: "pointer" }}
            >
              <span>{user.first_name + " " + user.last_name}</span>
            </li>
          ))}
        </div>
      </div>

      {selectedUser && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>User Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Name:</strong>{" "}
              {selectedUser.first_name + " " + selectedUser.last_name}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Office:</strong> {selectedUser.city}
            </p>
            <Form.Check
              type="checkbox"
              label="Change Office"
              checked={isEditingOffice}
              onChange={() => setIsEditingOffice(!isEditingOffice)}
            />
            {isEditingOffice && (
              <Form.Group controlId="formOfficeSelect">
                <Form.Label>Select New Office</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                >
                  {offices.map((office, index) => (
                    <option key={index} value={office.officeid}>
                      {office.city}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
            <Form.Check
              type="checkbox"
              label="Activate/Inactivate User"
              checked={isEditingStatus}
              onChange={() => setIsEditingStatus(!isEditingStatus)}
            />
            {isEditingStatus && (
              <Form.Group controlId="formStatusSelect">
                <Form.Label>Select User Status</Form.Label>
                <Form.Control
                  as="select"
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="Inactivate">Inactivate</option>
                  <option value="Activate">Activate</option>
                </Form.Control>
              </Form.Group>
            )}
            <Form.Check
              type="checkbox"
              label="Update Password"
              checked={isEditingPassword}
              onChange={() => setIsEditingPassword(!isEditingPassword)}
            />
            {isEditingPassword && (
              <Form.Group controlId="formPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            {(isEditingOffice || isEditingStatus || isEditingPassword) && (
              <Button variant="primary" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default UsersTable;
