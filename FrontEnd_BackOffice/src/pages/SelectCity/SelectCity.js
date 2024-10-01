import { useEffect, useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Card from '../../components/Card/Card';
import './SelectCity.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const SelectCity = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: '', firstName: '', lastName: '' });
  const [city, setCity] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    document.title = 'SoftShares - Select City';

    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchCities = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/administration/get-all-centers`);
        const filteredCities = response.data.data.filter((city) => city.city !== 'ALL');
        setCity(filteredCities);
        console.log('Cities:', filteredCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);

  const { email, firstName, lastName } = user;

  const handleSubmit = async () => {
    console.log('User:', user);
    console.log('Selected city:', selectedCity);
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        email: email,
        firstName: firstName,
        lastName: lastName,
        centerId: selectedCity,
      });
  
      console.log('Response:', res);
      Swal.fire({
        icon: 'success',
        title: 'User registered successfully',
        text: 'Please check your email for the activation link',
      }).then(() => {
        navigate('/');
      });
    } catch (error) {
      console.error('Error registering user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error registering user',
        text: error.response?.data?.message || 'An error occurred during registration',
      }).then(() => {
        navigate('/signup');
      });
    }
  };
  

  return (
    <div className="selectcity">
      <div className="text-center my-4">
        <h1 className="softshares">
          <span>Soft</span>
          <span className="text-primary">Shares</span>
        </h1>
        <h2 className="my-4 select-city-header">Select the city you live in:</h2>
      </div>
      <Container>
        <Row className="justify-content-center">
          {city.map((city) => (
            <Col key={city.officeid} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <div onClick={() => setSelectedCity(city.officeid)}>
                <Card
                  imagePlaceholderChangeIma={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${city.officeimage}`}
                  content={city.city}
                  selected={selectedCity === city.officeid}
                  className={selectedCity === city.officeid ? 'selected' : ''}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Container>
      <div className="text-center my-4">
        <Button variant="primary" className="advance-button" onClick={handleSubmit}>
          Advance
        </Button>
      </div>
    </div>
  );
};

export default SelectCity;
