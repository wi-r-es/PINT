import Navbar from '../../components/Navbar/Navbar';
import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Swal from 'sweetalert2';
import './CreateArea.css';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import Authentication from '../../Auth.service';

const CreateArea = () => {
  const [areaName, setAreaName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(null);
  const fileInputRef = useRef(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Create Area";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(JSON.stringify(res.token));
        setUser(res.user);
      }
    };

    checkCurrentUser();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedIcon(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!areaName || !selectedIcon) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
      });
      return;
    }
    try {
      const photoFormData = new FormData();
      photoFormData.append('image', fileInputRef.current.files[0]);

      // const uploadResponse = await axios.post(
      //   `${process.env.REACT_APP_BACKEND_URL}/upload`,
      //   photoFormData,
      //   { headers: { "Content-Type": "multipart/form-data",
      //     Authorization: `Bearer ${token}`
      //    } }
      // );
      const uploadResponse = await api.post('/upload/upload', photoFormData,{
        headers: {
          'Content-Type': 'multipart/form-data'
      }
      });
      console.log('Upload Response:', uploadResponse);

      const formData = {
        title: areaName,
        icon: uploadResponse.data.file.filename,
      };

      console.log('Create Area Data:', formData);

      // const response = await axios.post(
      //   `${process.env.REACT_APP_BACKEND_URL}/api/categories/create-category`,
      //   formData,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      const response = await api.post('/categories/create-category', formData );

      console.log('Create Area Response:', response);

      setAreaName("");
      setSelectedIcon(null);
      fileInputRef.current.value = null;

      Swal.fire({
        icon: 'success',
        title: 'Area Created',
        text: `Area Name: ${areaName}`,
      });
    } catch (error) {
      console.log('Error creating area:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to create area',
        text: error.message,
      });
    }
  };

  return (
    <>
      <Navbar />
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <Row className="w-100 justify-content-center">
          <Col xs={12} md={8} lg={5} className="bg-light rounded p-5 shadow">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formAreaName" className="mb-3">
                <Form.Label>Area Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Area Name"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formIcon" className="mb-3">
                <Form.Label>Upload Icon *</Form.Label>
                <div className="text-center mb-2">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Fill the area name first</Tooltip>}
                    show={!areaName}
                  >
                    <span className="d-inline-block">
                      <Button
                        onClick={handleFileClick}
                        variant="secondary"
                        disabled={!areaName}
                        style={{ pointerEvents: !areaName ? 'none' : 'auto' }}
                      >
                        Choose File
                      </Button>
                    </span>
                  </OverlayTrigger>
                  <Form.Control
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </Form.Group>
              <div className="text-center">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-50 softinsaButtonn"
                  disabled={!areaName || !selectedIcon}
                >
                  Create Area
                </Button>
              </div>
            </Form>
            {areaName && selectedIcon && (
              <ul className="list-group list-group-flush mt-4">
                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center area-item">
                  <span>{areaName}</span>
                  <img src={selectedIcon} alt="Area Icon" className="img-fluid rounded" style={{ width: '24px', height: '24px' }} />
                </li>
              </ul>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CreateArea;
