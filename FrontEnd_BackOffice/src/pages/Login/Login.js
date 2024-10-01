import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Authentication from "../../Auth.service";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  useEffect(() => {
    document.title = "SoftShares - Login";

    const checkCurrentUser = async () => {
      const token = await Authentication.getCurrentUser("login");
      if (token) {
        navigate("/homepage");
      }
    };

    checkCurrentUser();
  }, [navigate]);

  const handleLogin = async () => {
    setIsEmailEmpty(email === "");
    setIsPasswordEmpty(password === "");

    if (email === "" || password === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await Authentication.login(email, password);
      console.log(response);

      if (response) {
        navigate("/homepage");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    }
  };

  return (
    <Container fluid className="login">
      <Row className="justify-content-center mb-4">
        <Col md="auto">
          <div className="softshares-wrapper text-center">
            <h1 className="softshares mt-4">
              <span>Soft</span>
              <span className="shares">Shares</span>
            </h1>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Form className="facebook-login">
            <div className="mb-4 text-center">
              <div className="welcome-please-insert welcome-text">
                Welcome! Please insert your details:
              </div>
            </div>
            <div className="text-center mb-4">
              <img
                className="person-circle-icon"
                loading="lazy"
                alt=""
                src="/assets/personcircle.svg"
              />
            </div>
            <div className="input-fields mb-4">
              <Form.Group controlId="formUsername" className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  required
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value !== "") setIsEmailEmpty(false);
                  }}
                  className={isEmailEmpty ? "is-invalid" : ""}
                />
              </Form.Group>
              <Form.Group controlId="formPassword" className="mb-3">
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? "text" : "password"} // Toggle input type
                    placeholder="Password"
                    value={password}
                    required
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value !== "") setIsPasswordEmpty(false);
                    }}
                    className={isPasswordEmpty ? "is-invalid" : ""}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </Button>
                </div>
              </Form.Group>
              <div className="d-flex justify-content-between mb-3">
                <a className="component-1" role="button" href="/signup">
                  Don’t have an account?
                </a>
              </div>
              <div className="text-center mb-3">
                <Button
                  className="w-100 login-button"
                  variant="primary"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </div>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
