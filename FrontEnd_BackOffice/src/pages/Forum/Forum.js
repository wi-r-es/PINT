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
import "./Forum.css";
import api from "../../api";
import { useNavigate, useHistory } from "react-router-dom";
import Authentication from "../../Auth.service";

const Forums = () => {
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedForum, setSelectedForum] = useState({});
  const [updateStatus, setUpdateStatus] = useState(null);
  const [newForumTitle, setNewForumTitle] = useState("");
  const [newForumContent, setNewForumContent] = useState("");
  const [subareas, setSubareas] = useState([]);
  const [selectedSubarea, setSelectedSubarea] = useState("");

  useEffect(() => {
    document.title = "Forums";

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
    const fetchForums = async () => {
      if (!user) return;

      try {
        const response = await api.get("/dynamic/all-content");
        if (user.office_id === 0) {
          setForums(
            response.data.forums.filter((forum) => forum.validated === true)
          );
        } else {
          setForums(
            response.data.forums.filter(
              (forum) =>
                forum.validated === true && forum.office_id === user.office_id
            )
          );
        }
      } catch (error) {
        console.error("Error fetching forums:", error);
      }
    };

    fetchForums();
  }, [user]);

  useEffect(() => {
    const fetchSubareas = async () => {
      try {
        const response = await api.get("/categories/get-sub-areas");
        setSubareas(response.data.data);
      } catch (error) {
        console.error("Error fetching subareas:", error);
      }
    };

    fetchSubareas();
  }, []);

  const handleEditClick = (forum) => {
    setSelectedForum(forum);
    setUpdateStatus(forum.forum_status); // Initialize with current status
    setShowModal(true);
  };

  const handleAddForumClick = () => {
    setShowModal(true);
    setSelectedForum(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedForum({});
  };

  const handleSaveChanges = async () => {
    if (selectedForum) {
      // Update existing forum
      try {
        const formData = {
          state: updateStatus,
        };

        await api.patch(
          `/forum/change-state/${selectedForum.forum_id}`,
          formData
        );
        setShowModal(false);
        Swal.fire("Success", "The Forum has been updated.", "success");

        // Refresh the data
        const response = await api.get("/dynamic/all-content");
        if (user.office_id === 0) {
          setForums(
            response.data.forums.filter((forum) => forum.validated === true)
          );
        } else {
          setForums(
            response.data.forums.filter(
              (forum) =>
                forum.validated === true && forum.office_id === user.office_id
            )
          );
        }
      } catch (error) {
        console.error("Error updating Forum:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.message ||
            "An error occurred while updating the Forum.",
          "error"
        );
      }
    } else {
      // Add new forum
      try {
        const formData = {
          title: newForumTitle,
          description: newForumContent,
          subAreaId: selectedSubarea, // Include the selected subarea
          publisher_id: user.user_id,
          officeID: user.office_id,
        };

        await api.post("/forum/create", formData);
        setShowModal(false);
        Swal.fire("Success", "The Forum has been added.", "success");

        // Refresh the data
        const response = await api.get("/dynamic/all-content");
        setForums(
          response.data.forums.filter((forum) => forum.validated === true)
        );
      } catch (error) {
        console.error("Error adding Forum:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.message ||
            "An error occurred while adding the Forum.",
          "error"
        );
      }
    }
  };

  const handleInputChange = () => {
    setUpdateStatus(!selectedForum.forum_status); // Toggle status based on the checkbox
  };

  return (
    <>
      <Navbar />
      <Container className="down mt-5">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">Forum</h1>
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
              onClick={handleAddForumClick}
            >
              + Add Forum
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
              <th>Forum Title</th>
              <th>Content</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forums.map((forum) => (
              <tr
                key={forum.sub_area_id}
                onClick={() => navigate(`/forum/${forum.forum_id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{forum.title}</td>
                <td>{forum.content}</td>
                <td>
                  {forum.forum_status ? (
                    <span style={{ color: "green" }}>Active</span>
                  ) : (
                    <span style={{ color: "red" }}>Inactive</span>
                  )}
                </td>
                <td
                  onClick={(e) => e.stopPropagation()} // Prevents the row click from triggering when clicking the buttons
                >
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleEditClick(forum)}
                    style={{
                      backgroundColor: "#00b0ff",
                      borderColor: "#00b0ff",
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    variant="secondary"
                    disabled
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
                            await api.delete(`/forum/delete/${forum.forum_id}`);
                            Swal.fire(
                              "Deleted!",
                              "The Forum has been deleted.",
                              "success"
                            );
                            setForums(
                              forums.filter(
                                (forumItem) =>
                                  forumItem.forum_id !== forum.forum_id
                              )
                            );
                          } catch (error) {
                            console.error("Error deleting Forum:", error);
                            Swal.fire(
                              "Error!",
                              error.response?.data?.message ||
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

        {/* Modal for adding/editing */}
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedForum ? "Update Forum State" : "Add New Forum"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedForum ? (
              <Form>
                {selectedForum.forum_status ? (
                  <>
                    <p>Do you wish to deactivate this forum?</p>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check
                        type="checkbox"
                        label="Deactivate Forum"
                        name="forum_status_des"
                        checked={!updateStatus}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </>
                ) : (
                  <>
                    <p>Do you wish to activate this forum?</p>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check
                        type="checkbox"
                        label="Activate Forum"
                        name="forum_status_act"
                        checked={updateStatus}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </>
                )}
              </Form>
            ) : (
              <Form>
                <Form.Group className="mb-3" controlId="newForumTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter title"
                    value={newForumTitle}
                    onChange={(e) => setNewForumTitle(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="newForumContent">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter content"
                    value={newForumContent}
                    onChange={(e) => setNewForumContent(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="selectSubarea">
                  <Form.Label>Select Subarea</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedSubarea}
                    onChange={(e) => setSelectedSubarea(e.target.value)}
                  >
                    <option value="">Select Subarea</option>
                    {subareas.map((subarea) => (
                      <option
                        key={subarea.sub_area_id}
                        value={subarea.sub_area_id}
                      >
                        {subarea.title}
                      </option>
                    ))}
                  </Form.Control>
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

export default Forums;
