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
import "./area.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import Authentication from "../../Auth.service";

const Area = () => {
  const navigate = useNavigate();
  const [Area, setArea] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [changeImage, setChangeImage] = useState(false);

  useEffect(() => {
    document.title = "Areas";

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
    const fetchAreas = async () => {
      try {
        const response = await api.get("/categories/get-areas");
        setArea(response.data.data);
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    };

    fetchAreas();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    setChangeImage(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (area) => {
    setSelectedArea(area);
    if (area.icon_name) {
      setSelectedImage(
        `${process.env.REACT_APP_BACKEND_URL}/api/uploads/${area.icon_name}`
      );
    } else {
      setSelectedImage(null);
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedArea(null);
    setSelectedImage(null);
    setChangeImage(false);
  };

  const handleSaveChanges = async () => {
    if (!selectedArea.title) {
      Swal.fire("Error", "Area title is required", "error");
      return;
    }
    try {
      let filePath = selectedImage;
      if (changeImage && fileInputRef.current.files[0]) {
        const photoFormData = new FormData();
        photoFormData.append("image", fileInputRef.current.files[0]);

        const uploadResponse = await api.post("/upload/upload", photoFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        filePath = uploadResponse.data.file.filename;
      }

      const formData = {
        title: selectedArea.title,
        icon: changeImage ? filePath : undefined,
      };
      await api.patch(
        `categories/update-category/${selectedArea.area_id}`,
        formData
      );
      setShowModal(false);
      Swal.fire("Success", "The area has been updated.", "success");

      // Refresh the data
      const response = await api.get("/categories/get-areas");
      setArea(response.data.data);
    } catch (error) {
      console.error("Error updating area:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "An error occurred while updating the area.",
        "error"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedArea((prevState) => ({
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
            <h1 className="text-center">Areas</h1>
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
              onClick={() => navigate("/addArea")}
            >
              + Add Area
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
              <th>Title</th>
              <th>Icon</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Area.map((area) => (
              <tr key={area.area_id}>
                <td>{area.title}</td>
                <td>
                  {area.icon_name ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${area.icon_name}`}
                      alt="Icon"
                      style={{ width: "30px", height: "auto" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
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
                              `/categories/delete-category/${area.area_id}`
                            );
                            Swal.fire(
                              "Deleted!",
                              "The area has been deleted.",
                              "success"
                            );
                            setArea(
                              Area.filter(
                                (areaItem) => areaItem.area_id !== area.area_id
                              )
                            );
                          } catch (error) {
                            console.error("Error deleting area:", error);
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
            <Modal.Title>Edit Area</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedArea && (
              <Form>
                {/* Image Placeholder */}
                <div
                  className="image-placeholderlight"
                  onClick={handleImageClick}
                  style={{
                    background: selectedImage
                      ? `url(${selectedImage}) no-repeat center/cover`
                      : "#000",
                    position: "relative",
                    width: "100%",
                    height: "200px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                >
                  {!selectedImage && (
                    <span
                      className="text-white"
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "1.5rem",
                        textAlign: "center",
                      }}
                    >
                      Add +
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {/* Title Field */}
                <Form.Group controlId="formTitle">
                  <Form.Label>Area Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={selectedArea.title}
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

export default Area;
