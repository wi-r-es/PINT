import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ButtonWithIcon from "../../components/ButtonWithIcon/ButtonWithIcon";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Container, Row, Col } from "react-bootstrap";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import UsersTable from "../../components/UsersTable/UsersTable";
import Authentication from "../../Auth.service";
import api from "../../api";
import TextCard from "../../components/TextCard/TextCard";
import BarChart from "../../components/BarChart/BarChart";
import PieChart from "../../components/PieChart/PieChart";

const Dashboard = () => {
  const [toValidate, setToValidate] = useState("");
  const [validated, setValidated] = useState(0);
  const [postsbycity, setPostsByCity] = useState([]);
  const [eventsbycity, setEventsByCity] = useState([]);
  const [commentsbycity, setCommentsByCity] = useState([]);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = "SoftShares - Dashboard";

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
    const getUser = async () => {
      if (token) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/auth/get-user-by-token`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUser(res.data.user);
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      }
    };

    getUser();
  }, [token]);

  useEffect(() => {
    const fetchToValidate = async () => {
      if (token && user) {
        try {
          const response = await api.get("/dashboard/toValidate");
          // const response = await axios.get(
          //   `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/toValidate`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${token}`,
          //     },
          //   }

          setToValidate(response.data);
        } catch (error) {
          console.error("Error fetching to validate", error);
        }
      }
    };

    const fetchValidated = async () => {
      if (token && user) {
        try {
          const response = await api.get("/dashboard/validated");
          // const response = await axios.get(
          //   `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/validated`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${token}`,
          //     },
          //   }
          // );
          setValidated(response.data);
        } catch (error) {
          console.error("Error fetching validated", error);
        }
      }
    };

    const fetchPostsByCity = async () => {
      if (token && user) {
        try {
          const response = await api.get("/dashboard/postsByCity");
          // const response = await axios.get(
          //   `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/postsByCity`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${token}`,
          //     },
          //   }
          // );
          setPostsByCity(response.data);
        } catch (error) {
          console.error("Error fetching posts by city", error);
        }
      }
    };

    const fetchEventsByCity = async () => {
      if (token && user) {
        try {
          const response = await api.get("/dashboard/eventsbycity");
          // const response = await axios.get(
          //   `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/eventsbycity`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${token}`,
          //     },
          //   }
          // );
          setEventsByCity(response.data);
        } catch (error) {
          console.error("Error fetching events by city", error);
        }
      }
    };

    const fetchCommentsByCity = async () => {
      if (token && user) {
        try {
          const response = await api.get("/dashboard/comments_by_city");
          // const response = await axios.get(
          //   `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/comments_by_city`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${token}`,
          //     },
          //   }
          // );
          setCommentsByCity(response.data);
        } catch (error) {
          console.error("Error fetching comments by city", error);
        }
      }
    };

    fetchToValidate();
    fetchValidated();
    fetchPostsByCity();
    fetchEventsByCity();
    fetchCommentsByCity();
  }, [user, token]);

  return (
    <>
      <Navbar />
      <Container fluid className="Conteudo mt-5">
        <Row className="homepage-grid w-100 h-100">
          <Col xs={12} md={3} className="category-card w-100">
            <div className="center-category">
              {token && user && <UsersTable token={token} user={user} />}
            </div>
            {user && user.office_id === 0 && (
              <>
            <ButtonWithIcon
              icon={"fas fa-plus plus_icon"}
              text={`Create Area/ Category`}
              onClick={() => {
                navigate("/addArea");
              }}
            />
            <ButtonWithIcon
              icon={"fas fa-plus plus_icon"}
              text={`Create Sub Area/ Activity`}
              onClick={() => {
                navigate("/addSubArea");
              }}
            />
           
              <ButtonWithIcon
                icon={"fas fa-plus plus_icon"}
                text={`Create Office/ Company`}
                onClick={() => {
                  navigate("/createAdmin");
                }}
              />
              </>
            )}
          </Col>
          <Col xs={12} md={9} className="posts-manage-grid w-100">
            <Row>
              <Col xs={12} sm={6} md={3}>
                <TextCard
                  topText={"Number of Events to be Validated"}
                  bottomText={toValidate.events}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <TextCard
                  topText={"Number of Posts to be Validated"}
                  bottomText={toValidate.posts}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <TextCard
                  topText={"Number of Events Validated"}
                  bottomText={validated.events}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <TextCard
                  topText={"Number of Posts Validated"}
                  bottomText={validated.posts}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <BarChart
                  data={postsbycity}
                  title="Number of Posts by City"
                  dataKey="post_count"
                />
              </Col>
              <Col xs={12} md={6}>
                <BarChart
                  data={eventsbycity}
                  title="Number of Events by City"
                  dataKey="event_count"
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <PieChart
                  data={commentsbycity}
                  title="Number of Comments by City"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
