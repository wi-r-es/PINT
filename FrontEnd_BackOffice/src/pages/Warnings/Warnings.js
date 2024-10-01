import Navbar from "../../components/Navbar/Navbar";
import React, { useState, useEffect } from "react";
import {
  Table,
  Container,
  Button,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";
import Swal from "sweetalert2";
import "./warnings.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import Authentication from "../../Auth.service";

const Warnings = () => {
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [reload, setReload] = useState(false);
  const [centers, setCenters] = useState([]);

  useEffect(() => {
   const fetchCenters = async () => {
    try{
      const centers = await api.get("/administration/get-all-centers");
      setCenters(centers.data.data);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
    };
    fetchCenters();
    }, []);

  useEffect(() => {
    document.title = "Warnings";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(res.token);
        setUser(res.user);
      }
    };

    checkCurrentUser();
  }, []);

  useEffect(() => {
    const fetchWarnings = async () => {
      if (!user) return;

      try {
        const response = await api.get("/administration/get-all-warnings");
        if (user.office_id === 0) {
          setWarnings(response.data.data);
          console.log(response.data.data);
        } else {
          setWarnings(
            response.data.data.filter(
              (warning) => warning.office_id === user.office_id
            )
          );
        }
      } catch (error) {
        console.error("Error fetching warnings:", error);
      }
    };

    fetchWarnings();

    // Set up interval to refresh warnings every 3 seconds
    const intervalId = setInterval(fetchWarnings, 3000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [user]);

  const handleAddWarningClick = () => {
    setSelectedWarning(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedWarning(null);
  };

  const handleAddWarning = async () => {
    console.log(selectedWarning);
    console.log(user);
    if (user.office_id === 0) {
      const centers = await api.get("/administration/get-all-centers");
      console.log(centers.data.data);
    
      centers.data.data.forEach(async (element) => {
        const teste = {
          warning_level: selectedWarning.warning_level,
          description: selectedWarning.content,
          admin_id: user.user_id,
          office_id: element.officeid,
        };
    
        try {
          await api.post("/administration/create-warnings", teste);
          console.log(`Warning created for office ${element.officeid}`);
        } catch (error) {
          console.error(`Error creating warning for office ${element.officeid}`, error);
        }
      });
    
      return;
    }
    
    const teste2 = {
      warning_level: selectedWarning.warning_level,
      description: selectedWarning.content,
      admin_id: user.user_id,
      office_id: user.office_id,
    };

    api
      .post("/administration/create-warnings", teste2)
      .then((res) => {
        console.log(res);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Warning has been added successfully",
        });
      })
      .then(() => {
        setReload(!reload);
        setShowModal(false);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred. Please try again.",
        });
      });
    setReload(!reload);
  };

  const handleStateChange = async (warning) => {
    try {
      const newState = !warning.state;

      // Send the warning ID in the URL and the new state in the body
      const response = await api.patch(
        `/administration/update-warning/${warning.warning_id}`,
        {
          state: newState,
        }
      );

      // If the API call was successful, show a success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Warning state has been changed successfully",
      });

      console.log(response);
    } catch (err) {
      // If there was an error, show an error message
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred. Please try again.",
      });
    }
    setReload(!reload);
  };

  return (
    <>
      <Navbar />
      <Container className="mt-5">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center text-primary">Warnings</h1>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col className="text-end">
            <Button
              variant="primary"
              onClick={handleAddWarningClick}
              style={{
                backgroundColor: "#00b0ff",
                borderColor: "#00b0ff",
                fontWeight: "bold",
              }}
            >
              + Add Warning
            </Button>
          </Col>
        </Row>
        {warnings.length === 0 ? (
          <Row>
            <Col className="text-center">
              <p>No warnings available.</p>
              <Button
                variant="primary"
                onClick={handleAddWarningClick}
                style={{
                  backgroundColor: "#00b0ff",
                  borderColor: "#00b0ff",
                  fontWeight: "bold",
                }}
              >
                + Add Warning
              </Button>
            </Col>
          </Row>
        ) : (
          <Table
            striped
            bordered
            hover
            className="table-responsive"
            style={{
              borderColor: "#00b0ff",
            }}
          >
            <thead style={{ backgroundColor: "#00b0ff", color: "#fff" }}>
              <tr>
                <th>Warning</th>
                <th>OfficeID</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {warnings.map((warning) => (
                <tr key={warning.warning_id}>
                  <td>{warning.description}</td>
                  <td>{centers.find((center) => center.officeid === warning.office_id)?.city || "City not found"}</td>

                  <td style={{ color: warning.state ? "green" : "red" }}>
                    {warning.state ? "Active" : "Inactive"}
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => handleStateChange(warning)}
                      style={{
                        marginLeft: "14px",
                        backgroundColor: "#00b0ff",
                        borderColor: "#00b0ff",
                      }}
                    >
                      Change State
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>

      {/* Modal for Adding/Editing Warning */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedWarning ? "Edit Warning" : "Add Warning"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formWarningLevel">
              <Form.Label>Warning Level</Form.Label>
              <Form.Control
                as="select"
                value={selectedWarning?.warning_level || ""}
                onChange={(e) =>
                  setSelectedWarning({
                    ...selectedWarning,
                    warning_level: parseInt(e.target.value, 10), // Convert the selected value to a number
                  })
                }
              >
                <option value="">Select warning level</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formWarningContent" className="mt-3">
              <Form.Label>Warning Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter warning content"
                value={selectedWarning?.content || ""}
                onChange={(e) =>
                  setSelectedWarning({
                    ...selectedWarning,
                    content: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // Handle save logic here
              handleAddWarning();
            }}
            style={{
              backgroundColor: "#00b0ff",
              borderColor: "#00b0ff",
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Warnings;
