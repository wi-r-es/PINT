import React, { useState, useRef, useEffect } from "react";
import api from "../../api";
import Navbar from "../../components/Navbar/Navbar";
import Authentication from "../../Auth.service";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  Form,
  Image,
} from "react-bootstrap";
import "./AlbumDetails.css";

const AlbumsPage = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const { album_id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SoftShares - Album Details";

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
    const fetchAlbums = async () => {
      if (!token || !album_id) return;

      try {
        const response = await api.get(`/media/get-album-photo/${album_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAlbumPhotos(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAlbums();
  }, [token, album_id]);

  const handleAddPhoto = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSavePhoto = async () => {
    if (!fileInputRef.current.files[0]) {
      alert("Please select a photo.");
      return;
    }

    try {
      const photoFormData = new FormData();
      photoFormData.append("image", fileInputRef.current.files[0]);

      const uploadResponse = await api.post("/upload/upload", photoFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const formData = {
        filePath: uploadResponse.data.file.filename,
      };

      console.log("formData", formData);

      await api.post(`/media/add-photo/album/${album_id}/${user.user_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh album photos after adding
      const updatedPhotos = await api.get(`/media/get-album-photo/${album_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlbumPhotos(updatedPhotos.data.data);

      handleCloseModal();
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo.");
    }
  };

  return (
    <>
      <Navbar />
      <Container className="albums-container mt-4">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">Album Details</h1>
            <div className="text-center">
              <Button variant="primary" onClick={handleAddPhoto}>
                Add Photo
              </Button>
            </div>
          </Col>
        </Row>
        {albumPhotos.length > 0 ? (
          <Row className="album-photos">
            {albumPhotos.map((photo, index) => {
              console.log(photo.filepath);
              return (
                <Col md={4} sm={6} xs={12} key={index} className="mb-4">
                  <Card className="h-100">
                    <Card.Img
                      variant="top"
                      src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${photo.filepath}`}
                      alt="Album Photo"
                      className="photo-img"
                    />
                      <Card.Body>
                        <Card.Text>{photo.first_name} {" "} {photo.last_name}</Card.Text>
                      </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Row>
            <Col>
              <p className="text-center">No Photos found.</p>
            </Col>
          </Row>
        )}
      </Container>

      {/* Add Photo Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPhotoFile" className="mt-3">
              <Form.Label>Select Photo</Form.Label>
              <Form.Control
                type="file"
                ref={fileInputRef}
                accept="image/*"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSavePhoto}>
            Save Photo
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AlbumsPage;
