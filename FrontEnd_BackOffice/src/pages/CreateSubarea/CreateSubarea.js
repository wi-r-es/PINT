import Navbar from '../../components/Navbar/Navbar';
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import './CreateSubArea.css';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import Authentication from '../../Auth.service';

const CreateSubArea = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [subAreaName, setSubAreaName] = useState("");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = "Create SubArea";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(JSON.stringify(res.token));
        setUser(res.user);
      }
    };

    checkCurrentUser();
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      if (!token) return;
      try {
        // const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/categories/get-areas`, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });
        const response = await api.get('/categories/get-areas');
        setAreas(response.data.data);
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    fetchAreas();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedArea || !subAreaName) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
      });
      return;
    }

    try {
      const formData = {
        areaId: selectedArea,
        title: subAreaName,
      };


      // const response = await axios.post(
      //   `${process.env.REACT_APP_BACKEND_URL}/api/categories/create-sub-category`,
      //   formData, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      const response = await api.post('/categories/create-sub-category',formData);


      setSelectedArea("");
      setSubAreaName("");

      Swal.fire({
        icon: 'success',
        title: 'SubArea Created',
        text: `SubArea Name: ${subAreaName}`,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to create subarea',
        text: error.response?.data?.message || error.message,
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
              <Form.Group controlId="formAreaSelect" className="mb-3">
                <Form.Label>Select Area *</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="" disabled>Select Area</option>
                  {areas.map((area) => (
                    <option key={area.area_id} value={area.area_id}>
                      {area.title}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formSubAreaName" className="mb-3">
                <Form.Label>SubArea Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="SubArea Name"
                  value={subAreaName}
                  onChange={(e) => setSubAreaName(e.target.value)}
                />
              </Form.Group>
              <div className="text-center">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-50 softinsaButton"
                  disabled={!selectedArea || !subAreaName}
                >
                  Create SubArea
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CreateSubArea;
