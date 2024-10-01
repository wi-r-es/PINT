import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import api from "../../api";
import Navbar from "../../components/Navbar/Navbar";
import Authentication from "../../Auth.service";
import "./CreateEvent.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const CreateEvent = ({ edit = false }) => {
  const navigate = useNavigate();
  const { event_id } = useParams();
  const fileInputRef = useRef(null);
  const [selectedSubArea, setSelectedSubArea] = useState("");
  const [subAreaList, setSubAreaList] = useState([]);
  const [eventLocation, setEventLocation] = useState({ lat: 0, lng: 0 });
  const [recurring, setRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState("");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [price, setPrice] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [verified, setVerified] = useState(false);
  const [changeImage, setChangeImage] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    document.title = "SoftShares - Create Event";

    const fetchCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(JSON.stringify(res.token));
        setUser(res.user);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (token) {
      const fetchSubAreas = async () => {
        try {
          const response = await api.get("/categories/get-sub-areas");
          setSubAreaList(response.data.data);
        } catch (error) {
          console.error(error);
        }
      };

      fetchSubAreas();
    }
  }, [token]);

  useEffect(() => {
    if (edit && event_id) {
      const fetchEventData = async () => {
        try {
          const response = await api.get(`/dynamic/get-event/${event_id}`);
          const event = response.data.data.event_;
          console.log(event);
          setSelectedSubArea(event.sub_area_id);
          setEventName(event.name);
          setDescription(event.description);
          setSelectedImage(event.filepath);
          setEventLocation({
            lat: parseFloat(event.event_location.split(" ")[0]),
            lng: parseFloat(event.event_location.split(" ")[1]),
          });
          

          const formattedDate = event.event_date.split("T")[0];
          setEventDate(formattedDate);
          setMaxParticipants(event.max_participants);
          setVerified(event.verified);

          setStartTime(event.start_time || "");
          setEndTime(event.end_time || "");
        } catch (error) {
          console.error(error);
        }
      };

      fetchEventData();
    }
  }, [edit, event_id]);

  useEffect(() => {
    if (edit && verified) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You cannot edit a verified event!",
      });
      navigate("/events");
    }
  }, [edit, verified, navigate]);

  const handleImageClick = () => {
    fileInputRef.current.click();
    setSelectedImage(null);
  };

  const handleFileChange = (event) => {
    setChangeImage(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecurringChange = (e) => {
    setRecurring(e.target.checked);
    if (e.target.checked) {
      setShowModal(true);
    } else {
      setRecurringPattern("");
    }
  };

  const handlePriceChange = (e) => {
    setShowPriceModal(e.target.checked);
    if (!e.target.checked) {
      setPrice("");
    }
  };

  const handleCloseModal = () => {
    if (!recurringPattern) {
      setRecurring(false);
    }
    setShowModal(false);
  };

  const handleClosePriceModal = () => {
    setShowPriceModal(false);
  };

  const handleMapClick = (event) => {
    setEventLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (
      !selectedSubArea ||
      !eventName ||
      !description ||
      !eventDate ||
      !eventLocation.lat ||
      !eventLocation.lng ||
      !maxParticipants ||
      !startTime || // Ensure startTime is provided
      !endTime      // Ensure endTime is provided
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "All fields are required!",
      });
      return;
    }

    try {
      let filePath = selectedImage;

      if (changeImage && fileInputRef.current.files[0]) {
        const photoFormData = new FormData();
        photoFormData.append("image", fileInputRef.current.files[0]);

        const uploadResponse = await api.post("/upload/upload", photoFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        filePath = uploadResponse.data.file.filename;
      }

      const formData = {
        subAreaId: selectedSubArea,
        name: eventName,
        description,
        eventDate,
        eventLocation: `${eventLocation.lat} ${eventLocation.lng}`,
        maxParticipants,
        filePath: changeImage ? filePath : undefined,
        startTime, // Include startTime
        endTime,   // Include endTime
      };

      console.log(formData);

      await api.patch(`/event/edit/${event_id}`, formData);

      Swal.fire({
        icon: "success",
        title: "Event Updated",
        text: `Name: ${eventName}, Sub Area: ${selectedSubArea}`,
      });
      navigate("/manage");

      resetForm();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to update event",
        text: error.message,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedSubArea ||
      !eventName ||
      !description ||
      !selectedImage ||
      !eventDate ||
      !eventLocation.lat ||
      !eventLocation.lng ||
      !maxParticipants ||
      !startTime || // Ensure startTime is provided
      !endTime      // Ensure endTime is provided
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "All fields are required!",
      });
      return;
    }

    try {
      const photoFormData = new FormData();
      photoFormData.append("image", fileInputRef.current.files[0]);

      const uploadResponse = await api.post("/upload/upload", photoFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const formData = {
        subAreaId: selectedSubArea,
        name: eventName,
        description,
        eventDate,
        location: `${eventLocation.lat} ${eventLocation.lng}`,
        max_participants: maxParticipants,
        filePath: uploadResponse.data.file.filename,
        startTime: startTime,
        endTime: endTime
      };

     const newEvent = await api.post("/event/create", {
        ...formData,
        officeId: user.office_id,
        publisher_id: user.user_id,
      });

      console.log(newEvent.data.data);

      Swal.fire({
        icon: "success",
        title: "Event Created",
        text: `Name: ${eventName}, Sub Area: ${selectedSubArea}`,
      });

      navigate(`/createform/${newEvent.data.data}`);

      resetForm();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to create event",
        text: error.message,
      });
    }
  };

  const resetForm = () => {
    setEventName("");
    setSelectedSubArea("");
    setDescription("");
    setSelectedImage(null);
    setEventDate("");
    setMaxParticipants("");
    setEventLocation({ lat: 0, lng: 0 });
    setStartTime(""); // Reset startTime
    setEndTime("");   // Reset endTime
    fileInputRef.current.value = null;
  };

  return (
    <>
      <Navbar />
      <Container className="margin4 min-vh-100 d-flex align-items-center justify-content-center">
        <Row className="w-100 justify-content-center">
          <Col xs={12} md={8} lg={5} className="bg-light rounded p-4 shadow">
            <div className="text-center mb-4">
              <div
                className="image-placeholder"
                onClick={handleImageClick}
                style={{
                  background: selectedImage
                    ? selectedImage.startsWith("data:")
                      ? `url(${selectedImage}) no-repeat center/cover`
                      : `url(${process.env.REACT_APP_BACKEND_URL}/api/uploads/${selectedImage}) no-repeat center/cover`
                    : "#000",
                  position: "relative",
                }}
              >
                {!selectedImage && <span className="text-white">Add +</span>}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <Form>
              <Form.Group controlId="formArea" className="mb-3">
                <Form.Label>Sub Area *</Form.Label>
                <Form.Select
                  value={selectedSubArea}
                  onChange={(e) => setSelectedSubArea(e.target.value)}
                >
                  <option value="" disabled>
                    Select Sub Area
                  </option>
                  {subAreaList.map((subarea) => (
                    <option
                      key={subarea.sub_area_id}
                      value={subarea.sub_area_id}
                    >
                      {subarea.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>Event Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formDescription" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formDate" className="mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={eventDate}
                  min={today}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formStartTime" className="mb-3">
                <Form.Label>Start Time *</Form.Label>
                <Form.Control
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="12:00:00"
                />
              </Form.Group>
              <Form.Group controlId="formEndTime" className="mb-3">
                <Form.Label>End Time *</Form.Label>
                <Form.Control
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="12:00:00"
                />
              </Form.Group>
              <Form.Group controlId="recurring" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Recurring"
                  checked={recurring}
                  onChange={handleRecurringChange}
                />
              </Form.Group>
              <Form.Group controlId="Price" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Price"
                  checked={showPriceModal}
                  onChange={handlePriceChange}
                />
              </Form.Group>
              <Form.Group controlId="maxParticipants" className="mb-3">
                <Form.Label>Max Participants *</Form.Label>
                <Form.Control
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  min={1}
                />
              </Form.Group>
              <Form.Group controlId="eventLocation" className="mb-3">
                <Form.Label>Event Location *</Form.Label>
                <div style={{ height: "400px", width: "100%" }}>
                  <LoadScript
                    googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                  >
                    <GoogleMap
                      mapContainerStyle={{ height: "100%", width: "100%" }}
                      center={
                        eventLocation.lat
                          ? eventLocation
                          : { lat: 39.5, lng: -8.0 }
                      }
                      zoom={10}
                      onClick={handleMapClick}
                    >
                      {eventLocation.lat && <Marker position={eventLocation} />}
                    </GoogleMap>
                  </LoadScript>
                </div>
              </Form.Group>

              <div className="text-center">
                {edit ? (
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-25 softinsaButtonn"
                    onClick={handleUpdate}
                  >
                    Update Event
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-25 softinsaButtonn"
                    onClick={handleSubmit}
                  >
                    Create Event
                  </Button>
                )}
              </div>
            </Form>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Select Recurring Pattern</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formRecurringPattern" className="mb-3">
            <Form.Check
              type="radio"
              label="Weekly"
              name="recurringPattern"
              value="weekly"
              onChange={(e) => setRecurringPattern(e.target.value)}
            />
            <Form.Check
              type="radio"
              label="Every 2 Weeks"
              name="recurringPattern"
              value="biweekly"
              onChange={(e) => setRecurringPattern(e.target.value)}
            />
            <Form.Check
              type="radio"
              label="Monthly"
              name="recurringPattern"
              value="monthly"
              onChange={(e) => setRecurringPattern(e.target.value)}
            />
            <Form.Check
              type="radio"
              label="Annual"
              name="recurringPattern"
              value="annual"
              onChange={(e) => setRecurringPattern(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (recurringPattern) {
                setShowModal(false);
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "You must select a recurring pattern!",
                });
              }
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPriceModal} onHide={handleClosePriceModal}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formPrice" className="mb-3">
            <Form.Label>Price *</Form.Label>
            <Form.Control
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={1}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePriceModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (price) {
                setShowPriceModal(false);
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "You must enter a price!",
                });
              }
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateEvent;
