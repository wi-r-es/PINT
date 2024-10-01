import Navbar from "../../components/Navbar/Navbar";
import React, { useState, useEffect, useRef } from "react";
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
import "./SubArea.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import Authentication from "../../Auth.service";

const SubArea = () => {
  const navigate = useNavigate();
  const [SubArea, setSubArea] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubArea, setSelectedSubArea] = useState({ title: '' }); // Initialize with default values

  useEffect(() => {
    document.title = "SubAreas";

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
    const fetchSubAreas = async () => {
      try {
        const response = await api.get("/categories/get-sub-areas");
        setSubArea(response.data.data);
      } catch (error) {
        console.error("Error fetching sub-areas:", error);
      }
    };

    fetchSubAreas();
  }, []);





  const handleEditClick = (subArea) => {
    setSelectedSubArea({
      ...subArea,
      title: subArea.title || '', // Ensure the title is never undefined
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSubArea({ title: '' }); // Reset to default
  };

  const handleSaveChanges = async () => {
    if (!selectedSubArea.title) {
      Swal.fire("Error", "SubArea title is required", "error");
      return;
    }
    try {
      let formData = {
        title: selectedSubArea.title,
      };

      // Handle image upload if changed
      

      await api.patch(
        `/categories/update-sub-category/${selectedSubArea.sub_area_id}`,
        formData
      );
      setShowModal(false);
      Swal.fire("Success", "The SubArea has been updated.", "success");

      // Refresh the data
      const response = await api.get("/categories/get-sub-areas");
      setSubArea(response.data.data);
    } catch (error) {
      console.error("Error updating SubArea:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "An error occurred while updating the SubArea.",
        "error"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedSubArea((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <Navbar />
      <Container className="down mt-5">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">SubAreas</h1>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col className="text-end">
            <Button
              variant="primary"
              style={{
                backgroundColor: "#00b0ff",
                borderColor: "#00b0ff",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/addSubArea")}
            >
              + Add SubArea
            </Button>
          </Col>
        </Row>
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
              <th>Area Title</th>
              <th>SubArea Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {SubArea.map((area) => (
              <tr key={area.sub_area_id}>
                <td>{area.area_title}</td>
                <td>{area.title}</td>
                <td>
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleEditClick(area)}
                    style={{
                      backgroundColor: "#00b0ff",
                      borderColor: "#00b0ff",
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      Swal.fire({
                        title: "Are you sure?",
                        text: "You won't be able to revert this!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, delete it!",
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                          try {
                            await api.delete(
                              `/categories/delete-sub-category/${area.sub_area_id}`
                            );
                            Swal.fire(
                              "Deleted!",
                              "The SubArea has been deleted.",
                              "success"
                            );
                            setSubArea(
                              SubArea.filter(
                                (areaItem) =>
                                  areaItem.sub_area_id !== area.sub_area_id
                              )
                            );
                          } catch (error) {
                            console.error("Error deleting SubArea:", error);
                            Swal.fire(
                              "Error!",
                              error.response?.data?.message || "An error occurred.",
                              "error"
                            );
                          }
                        }
                      });
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Modal for editing */}
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit SubArea</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedSubArea && (
              <Form>
                {/* SubArea Title Field */}
                <Form.Group controlId="formTitle">
                  <Form.Label>SubArea Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={selectedSubArea.title}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Form>
            )}
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
      </Container>
    </>
  );
};

export default SubArea;
