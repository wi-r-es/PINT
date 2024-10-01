import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Make sure to import this if you're using react-router for navigation
import api from "../../api";
import Navbar from "../../components/Navbar/Navbar";
import {
  Container,
  Button,
  Form,
} from "react-bootstrap";
import Authentication from "../../Auth.service";

const CreateOC = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState({
    city: "",
  });
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // Use navigate to redirect

  useEffect(() => {
    document.title = "Operational Centers";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setUser(res.user);
        if (res.user.office_id !== 0) {
          navigate("/notAuthorized");
        }
      }
    };

    checkCurrentUser();
  }, [navigate]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedCenter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCreateOC = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      let filePath = selectedImage;
      if (fileInputRef.current.files[0]) {
        const photoFormData = new FormData();
        photoFormData.append("image", fileInputRef.current.files[0]);

        const uploadResponse = await api.post("/upload/upload", photoFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        filePath = uploadResponse.data.file.filename;
      }
      console.log(user);
      await api.post("/administration/create-center", {
        ...selectedCenter,
        officeImage: filePath,
        admin: user.user_id,
      });


    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Navbar />
      <Container>
        <Form onSubmit={handleCreateOC}>
          {/* Image Placeholder */}
          <div
            className="image-placeholder"
            onClick={handleImageClick}
            style={{
              background: selectedImage
                ? `url(${selectedImage}) no-repeat center/cover`
                : "#000",
              position: "relative",
              width: "100%",
              height: "200px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            {!selectedImage && (
              <span
                className="text-white"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "1.5rem",
                  textAlign: "center",
                }}
              >
                Add +
              </span>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            required
          />

          <Form.Group controlId="formCity">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={selectedCenter.city}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Button className="btn btn-primary" type="submit">
            Create Operational Center
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default CreateOC;
