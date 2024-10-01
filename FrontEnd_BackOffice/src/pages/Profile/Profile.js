import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Profile.css";
import PostsCard from "../../components/PostsCard/PostCard";
import { useNavigate } from "react-router-dom";
import Authentication from "../../Auth.service";
import api from "../../api";
import Swal from "sweetalert2";
import { Modal, Button, Form } from "react-bootstrap";

const Profile = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [Areas, setAreas] = useState([]);
  const [Subtopics, setSubtopics] = useState([]);
  const [oldPreferences, setOldPreferences] = useState([]);
  const [selectedSubareas, setSelectedSubareas] = useState([]);
  const [createPreferences, setCreatePreferences] = useState(false);

  useEffect(() => {
    document.title = "SoftShares - Profile";

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
    const fetchData = async () => {
      try {
        const areasResponse = await api.get("/categories/get-areas");
        const subtopicsResponse = await api.get("/categories/get-sub-areas");
        setAreas(areasResponse.data.data);
        setSubtopics(subtopicsResponse.data.data);
      } catch (error) {
        console.error("Error fetching areas and subtopics", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (Areas.length > 0 && Subtopics.length > 0) {
      const fetchOldPreferences = async () => {
        try {
          const response = await api.get("/user/get-user-preferences");
          const notificationsTopic = response.data.data.notifications_topic;
          setOldPreferences(notificationsTopic);

          // Flatten the subareas from notificationsTopic into selectedSubareas
          const selectedSubareas = notificationsTopic.flatMap((item) =>
            item.subareas
              .map((subarea) => {
                const matchingSubtopic = Subtopics.find(
                  (sub) =>
                    sub.title === subarea &&
                    sub.area_id ===
                      Areas.find((area) => area.title === item.area).area_id
                );
                return matchingSubtopic
                  ? matchingSubtopic.sub_area_id.toString()
                  : null;
              })
              .filter(Boolean)
          );
          setSelectedSubareas(selectedSubareas); // Set initial selected subareas
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setCreatePreferences(true);
          } else {
            console.error("Error fetching user preferences", error);
          }
        }
      };

      fetchOldPreferences();
    }
  }, [Subtopics, Areas]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        Authentication.logout();
        navigate("/login");
      }
    });
  };

  const updateUserPreferences = async () => {
    const notificationsTopic = Areas.map((area) => {
        const subareasInArea = Subtopics.filter(
          (sub) => sub.area_id === area.area_id && selectedSubareas.includes(sub.sub_area_id.toString())
        ).map((sub) => sub.title);
  
        if (subareasInArea.length > 0) {
          return {
            area: area.title,
            subareas: subareasInArea,
          };
        }
        return null;
      }).filter((topic) => topic !== null);
  
      console.log(notificationsTopic); // To verify the structure before sending
  
      if (createPreferences) {
        try {
          const response = await api.post("/user/create-user-preferences", {
            notificationsTopic: JSON.stringify(notificationsTopic),
          });
          console.log(response.data);
          Swal.fire({
            title: "Preferences created successfully!",
            icon: "success",
          });
          handleCloseModal();
        } catch (error) {
          console.error("Error creating preferences", error);
          Swal.fire({
            title: "An error occurred while creating preferences",
            icon: "error",
          });
        }
      } else {
        try {
            const response = await api.patch(`/user/update-user-preferences/${user.user_id}`, {
                preferences: JSON.stringify(notificationsTopic),
            });
            console.log(response.data);
            Swal.fire({
              title: "Preferences created successfully!",
              icon: "success",
            });
            handleCloseModal();
          } catch (error) {
            console.error("Error creating preferences", error);
            Swal.fire({
              title: "An error occurred while creating preferences",
              icon: "error",
            });
          }
      }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (token && user) {
        try {
          const response = await api.get("/dynamic/all-content");
          setPosts(
            response.data.posts.filter(
              (post) => post.publisher_id === user.user_id
            )
          );
        } catch (error) {
          console.error("Error fetching user posts", error);
        }
      }
    };

    fetchUserPosts();
  }, [token, user]);

  const handleSubareaChange = (e) => {
    const subareaId = e.target.value;
    if (e.target.checked) {
      setSelectedSubareas([...selectedSubareas, subareaId]);
    } else {
      setSelectedSubareas(selectedSubareas.filter((id) => id !== subareaId));
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container my-4 profile-container">
        <div className="row">
          <div className="col-md-3 profile-sidebar">
            <div className="profile-pic-container">
              <img
                src="./assets/personcircle.svg"
                alt="profile"
                className="profile-pic img-fluid rounded-circle"
              />
              <span
                onClick={handleShowModal}
                className="edit-profile-icon"
                style={{ cursor: "pointer" }}
              >
                <i className="fas fa-pencil-alt"></i>
              </span>
            </div>
            <h2>
              {user.first_name} {user.last_name}
            </h2>
            <h4>{user.role}</h4>
            <div className="contact-info">
              <p>
                <i className="fas fa-envelope"></i> {user.email}
              </p>
              <p>
                <a
                  onClick={handleLogout}
                  className="bigger"
                  style={{ cursor: "pointer" }}
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </a>
              </p>
            </div>
          </div>
          <div className="col-md-9 profile-content">
            <h3>{user.first_name}'s Posts:</h3>
            <div className="row">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div className="col-md-4" key={post.post_id}>
                    <PostsCard
                      className="mb-4"
                      imagealt={post.title}
                      imagePlaceholderChangeIma={post.filepath}
                      title={post.title}
                      description={post.description}
                      content={post.content}
                      rating={post.rating}
                      postedBy={`${user.user_id}`}
                      id={post.post_id}
                      token={token}
                    />
                  </div>
                ))
              ) : (
                <p>No posts available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for editing profile */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>User Preferences</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="subareaSelect">
            <Form.Label>Select Subareas</Form.Label>
            {Areas.map((area) => (
              <div key={area.area_id}>
                <h5>{area.title}</h5>
                {Subtopics.filter((sub) => sub.area_id === area.area_id).map(
                  (sub) => (
                    <Form.Check
                      key={sub.sub_area_id}
                      type="checkbox"
                      label={sub.title}
                      value={sub.sub_area_id.toString()}
                      checked={selectedSubareas.includes(
                        sub.sub_area_id.toString()
                      )}
                      onChange={handleSubareaChange}
                    />
                  )
                )}
              </div>
            ))}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={updateUserPreferences}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Profile;
