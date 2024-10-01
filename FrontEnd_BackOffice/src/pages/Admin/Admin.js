import React, { useState, useEffect } from "react";
import { Table, Container, Button, Row, Col, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import "./admin.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import Authentication from "../../Auth.service";
import Navbar from "../../components/Navbar/Navbar";

const Admin = () => {
  const navigate = useNavigate();
  const [centerAdmins, setCenterAdmins] = useState([]);
  const [serverAdmins, setServerAdmins] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", firstName: "", lastName: "" });

  useEffect(() => {
    document.title = "Admins";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(JSON.stringify(res.token));
        setUser(res.user);
        if (res.user.office_id !== 0) {
          navigate("/notAuthorized");
        }
      }
    };

    checkCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const centerResponse = await api.get("/user/get-user-by-role/CenterAdmin");
        setCenterAdmins(centerResponse.data.data);

        const serverResponse = await api.get("/user/get-user-by-role/ServerAdmin");
        setServerAdmins(serverResponse.data.data);
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    const getOffices = async () => {
      try {
        const response = await api.get("/administration/get-all-centers");
        const filteredOffices = response.data.data.filter(office => office.city !== "ALL");
        setOffices(filteredOffices);
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
      }
    };

    if (token) {
      fetchAdmins();
      getOffices();
    }
  }, [token, refresh]);

  const handleEditClick = (admin) => {
    setSelectedUser(admin);
    setSelectedOffice(admin.office_id);
    setShowModal(true);
  };

  const handleDeleteClick = async (admin) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/administration/delete-admin/${admin.user_id}`);
        Swal.fire("Deleted!", "The admin has been deleted.", "success");
        setRefresh(!refresh);
      } catch (error) {
        console.error("Error deleting admin:", error);
        Swal.fire("Error!", error.response?.data?.message || "An error occurred.", "error");
      }
    }
  };

  const handleSaveChanges = async () => {
    if (selectedUser) {
      try {
        await api.post("/dynamic/update-user-office", {
          user_id: selectedUser.user_id,
          office_id: selectedOffice,
        });

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Office updated successfully",
        });
        setRefresh(!refresh);
        setShowModal(false);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "An error occurred.",
        });
        console.error(err.response ? err.response.data : err.message);
      }
    }
  };

  const handleAddAdmin = async () => {
    try {
      await api.post("/administration/create-center-admin", {
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        centerId: selectedOffice,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Admin added successfully",
      });
      setRefresh(!refresh);
      setShowAddModal(false);
      setNewAdmin({ email: "", firstName: "", lastName: "" });
      setSelectedOffice("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "An error occurred.",
      });
      console.error(err.response ? err.response.data : err.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedOffice("");
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setNewAdmin({ email: "", firstName: "", lastName: "" });
    setSelectedOffice("");
  };

  return (
    <>
      <Navbar />
      <Container className="down mt-5">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">Admins</h1>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col className="text-end">
            <Button
              variant="primary"
              style={{ backgroundColor: "#00b0ff", borderColor: "#00b0ff", fontWeight: "bold" }}
              onClick={() => setShowAddModal(true)}
            >
              + Add Admin
            </Button>
          </Col>
        </Row>
        <Table
          striped
          bordered
          hover
          className="table-responsive"
          style={{ borderColor: "#00b0ff" }}
        >
          <thead style={{ backgroundColor: "#00b0ff", color: "#fff" }}>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {centerAdmins.map((admin) => (
              <tr key={admin.user_id}>
                <td>{admin.name}</td>
                <td>{admin.city}</td>
                <td>
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleEditClick(admin)}
                    style={{ backgroundColor: "#00b0ff", borderColor: "#00b0ff" }}
                  >
                    Change Office
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteClick(admin)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {serverAdmins.map((admin) => (
              <tr key={admin.user_id}>
                <td>{admin.name}</td>
                <td>{admin.city}</td>
                <td>{/* Actions for ServerAdmins can be added here */}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Change Office</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="formOfficeSelect">
              <Form.Label>Select New Office</Form.Label>
              <Form.Control
                as="select"
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
              >
                <option value="" disabled selected>
                  Select an option
                </option>
                {offices.map((office, index) => (
                  <option key={index} value={office.officeid}>
                    {office.city}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: "#00b0ff", borderColor: "#00b0ff" }}
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAddModal} onHide={handleAddModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add Admin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                value={newAdmin.firstName}
                onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={newAdmin.lastName}
                onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formOfficeSelect">
              <Form.Label>Select Office</Form.Label>
              <Form.Control
                as="select"
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
              >
                <option value="" disabled selected>
                  Select an option
                </option>
                {offices.map((office, index) => (
                  <option key={index} value={office.officeid}>
                    {office.city}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleAddModalClose}>
              Close
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: "#00b0ff", borderColor: "#00b0ff" }}
              onClick={handleAddAdmin}
            >
              Add Admin
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Admin;
