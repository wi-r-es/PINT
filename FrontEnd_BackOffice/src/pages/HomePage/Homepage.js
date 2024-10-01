import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import PostsCard from '../../components/PostsCard/PostCard'; // Corrected the import name
import Calendar from '../../components/Calendar/Calendar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Container, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import './Homepage.css';
import api from '../../api';
import Authentication from '../../Auth.service';
import Swal from 'sweetalert2';
import ForumCard from '../../components/ForumCard/ForumCard';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', options).split('/').join('/');
};

const Homepage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [forum, setForum] = useState([]);
  const [user, setUser] = useState(null);
  const [firstLogin, setFirstLogin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [filteredArea, setFilteredArea] = useState("");

  useEffect(() => {
    document.title = "SoftShares - Home Page";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
       // setToken(JSON.stringify(res.token));
        setToken(res.token);
        setUser(res.user);
      }
    };

    checkCurrentUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const area = params.get("area");
    if (area) {
      setFilteredArea(area);
    }
  }, [location]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/get-user-by-token');
          // const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/get-user-by-token`, {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //   },
          // });

          if (res.data.user.last_access === null) {
            setFirstLogin(true);
            setShowModal(true);
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      }
    };

    fetchUser();
  }, [token]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords do not match',
        text: 'Please make sure the passwords match.',
      });
      return;
    }

    try {
      const res = await api.post('/auth/change-password', {password: newPassword})
      // const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/change-password`, {
      //   password: newPassword
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // });
      if (res.status === 200) {
        setShowModal(false);
        setFirstLogin(false);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Password Change Failed',
        text: error.response?.data?.message || 'An error occurred. Please try again.',
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (token && user) {
        try {
          const response = await api.get('/dynamic/all-content');
          // const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dynamic/all-content`, {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //   },
          // });
          console.log(response)
          let filteredPosts = user.office_id !== 0 ? 
            response.data.posts.filter(post => post.office_id === user.office_id && post.validated === true) :
            response.data.posts.filter(post => post.validated === true);
          let filteredEvents = user.office_id !== 0 ? 
            response.data.events.filter(event => event.office_id === user.office_id && event.validated === true) :
            response.data.events.filter(event => event.validated === true);
          let filteredForum = user.office_id !== 0 ? 
            response.data.forums.filter(forum => forum.office_id === user.office_id && forum.validated === true) :
            response.data.forums.filter(forum => forum.validated === true);

          if (filteredArea) {
            //filteredData = filteredData.filter(item => parseInt(item.sub_area_id.toString().slice(0, 3), 10) === areaNumber || item.area === areaNumber);
            const areaNumber = Number(filteredArea);
            filteredPosts = filteredPosts.filter(item => parseInt(item.sub_area_id.toString().slice(0, 3), 10) === areaNumber || item.area === areaNumber);
            filteredEvents = filteredEvents.filter(item => parseInt(item.sub_area_id.toString().slice(0, 3), 10) === areaNumber || item.area === areaNumber);
            filteredForum = filteredForum.filter(item => parseInt(item.sub_area_id.toString().slice(0, 3), 10) === areaNumber || item.area === areaNumber);
          }
          
          setPosts(filteredPosts);
          console.log(filteredPosts)
          setEvents(filteredEvents);
          
          setForum(filteredForum);
          
        } catch (error) {
          console.error("Error fetching data", error);
        }
      }
    };

    fetchData();
    console.log(posts)
  }, [token, user, filteredArea]);

  return (
    <>
      <Navbar />
      <img src="./assets/SofinsaRectangle.png" alt="Softinsa" className="w-100" />
      <Container fluid className="Conteudo mt-5">
        <Row className="homepage-grid">
          <Col xs={12} md={3} className="category-card w-100 h-100">
            <div className='center-category'>
              <CategoryCard token={token}/>
            </div>
            <div className="center-calendar">
              <Calendar token={token} user={user} />
            </div>
          </Col>
          <Col xs={12} md={9} className="posts-grid w-100 justify-content-center">
            {posts.map((post) => (
              <PostsCard
                key={post.post_id}
                imagealt={post.title}
                imagePlaceholderChangeIma={post.filepath}
                title={post.title}
                description={post.description}
                content={post.content}
                rating={post.score}
                postedBy={post.publisher_id}
                id={post.post_id}
                token={token}
              />
            ))}
            {events.map((event) => (
              <PostsCard
                key={event.event_id}
                type='E'
                imagealt={event.name}
                imagePlaceholderChangeIma={event.filepath}
                title={event.name}
                description={event.description}
                content={event.content}
                rating={event.rating}
                postedBy={event.publisher_id}
                id={event.event_id}
                date={formatDate(event.event_date)}
                token={token}
              />
            ))}
            {forum.map((forum) => (
                    <Col
                      xs={12}
                      md={4}
                      lg={3}
                      key={forum.forum_id}
                      className="mb-4"
                    >
                      <ForumCard
                        id={forum.forum_id}
                        title={forum.title}
                        content={forum.content}
                      />
                    </Col>
                  ))}
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNewPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handlePasswordChange}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Homepage;
