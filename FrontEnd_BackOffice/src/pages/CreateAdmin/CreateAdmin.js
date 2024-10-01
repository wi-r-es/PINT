import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import Authentication from '../../Auth.service';
import Swal from 'sweetalert2';
import { Container, Row, Col, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './CreateAdmin.css';
import Navbar from '../../components/Navbar/Navbar';

const CreateAdmin = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [centers, setCenters] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');

  useEffect(() => {
    document.title = "SoftShares - Create Admin";

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
    const fetchCities = async () => {
        try {
          // const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/administration/get-all-centers`,{
          //   headers: {
          //       Authorization: `Bearer ${token}`,
          //   }
          // });
          const response = await api.get('/administration/get-all-centers');
          const filteredCities = response.data.data.filter(city => city.city !== 'ALL');
          setCenters(filteredCities);
        } catch (error) {
          console.error('Error fetching cities:', error);
        }
      };
  
      fetchCities();
      console.log(centers);
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !selectedCenter) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
      });
      return;
    }
    console.log(email, password, selectedCenter);
  };

  return (
    <>
        <Navbar />
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={5} className="bg-light rounded p-5 shadow">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCenter" className="mb-3">
              <Form.Label>Select Center *</Form.Label>
              <Form.Control
                as="select"
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                required
              >
                <option value="" disabled>Select a center</option>
                {centers.map((center) => (
                  <option key={center.office_id} value={center.office_id}>{center.city}</option>
                ))}
              </Form.Control>
            </Form.Group>
            
            
            <div className="text-center">
              <Button
                variant="primary"
                type="submit"
                className="w-50"
                disabled={!email || !password || !selectedCenter}
              >
                Create Admin
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default CreateAdmin;
