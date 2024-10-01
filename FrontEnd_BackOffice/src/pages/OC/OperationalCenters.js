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
import "./OC.css";
import api from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import Authentication from "../../Auth.service";

const OC = () => {
  const navigate = useNavigate();
  const [OC, setOC] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [changeImage, setChangeImage] = useState(false);

  useEffect(() => {
    document.title = "Operational Centers";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(JSON.stringify(res.token));
        setUser(res.user);
        if (res.user.office_id != 0) {
          navigate("/notAuthorized");
        }
      }
    };

    checkCurrentUser();
  }, []);

  useEffect(() => {
    const fetchOC = async () => {
      try {
        const response = await api.get("/administration/get-all-centers");
        console.log(response.data.data);
        setOC(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOC();
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

  const handleEditClick = (center) => {
    setSelectedCenter(center);
    if (center.officeimage) {
      setSelectedImage(
        `${process.env.REACT_APP_BACKEND_URL}/api/uploads/${center.officeimage}`
      );
    } else {
      setSelectedImage(null);
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCenter(null);
    setSelectedImage(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedCenter.city) {
      Swal.fire("Error", "City is required", "error");
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
        city: selectedCenter.city,
        officeImage: changeImage ? filePath : undefined,
      };
      await api.patch(
        `/administration/update-center/${selectedCenter.officeid}`,
        formData
      );
      setShowModal(false);
      Swal.fire("Success", "The center has been updated.", "success");
      // Refresh the data
      const response = await api.get("/administration/get-all-centers");
      setOC(response.data.data);
    } catch (error) {
      console.error("Error updating center", error);
      Swal.fire(
        "Error!",
        "An error occurred while updating the center.",
        "error"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedCenter((prevState) => ({
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
            <h1 className="text-center">Operational Centers</h1>
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
              onClick={() => navigate("/add-center")}
            >
              + Add Operational Center
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
              <th>City</th>
              <th>Office Image</th>
              <th>Admins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {OC.map((center) => (
              <tr key={center.officeid}>
                <td>
                  {center.city === "ALL" ? (
                    <span style={{ fontWeight: "bold", color: "#000" }}>
                      Server Admin
                    </span>
                  ) : (
                    center.city
                  )}
                </td>

                <td>
                  {center.officeimage ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${center.officeimage}`}
                      alt="Office"
                      style={{ width: "100px", height: "auto" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>
                  <ul>
                    {center.name.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </td>

                <td>
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleEditClick(center)}
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
                              `/administration/delete-center/${center.officeid}`
                            );
                            Swal.fire(
                              "Deleted!",
                              "The center has been deleted.",
                              "success"
                            );
                            setOC(
                              OC.filter(
                                (office) =>
                                  office.officeid !== center.officeid
                              )
                            );
                          } catch (error) {
                            console.error("Error deleting center", error);
                            Swal.fire(
                              "Error!",
                              error.response.data.message ||
                                "An error occurred.",
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
            <Modal.Title>Edit Operational Center</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCenter && (
              <Form>
                {/* Image Placeholder */}
                <div
                  className="image-placeholder"
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

                {/* City Field */}
                <Form.Group controlId="formCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={selectedCenter.city}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                {/* Other Form Fields (if any) */}
                {/* Add more Form.Group components here as needed */}
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

export default OC;
