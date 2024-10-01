import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './404Page.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container className="vh-100 d-flex flex-column align-items-center text-center justify-content-center">
      <Row>
        <Col>
          <img src="/assets/logo-Softinsa.png" alt="Softinsa Logo" className="softinsa-logo" />
        </Col>
      </Row>
      <Row className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <Col>
          <h1 className="display-1 text-primary">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="mb-4">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Button variant="primary" onClick={handleGoHome} className="softinsaButtonn">
            Go to Homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
