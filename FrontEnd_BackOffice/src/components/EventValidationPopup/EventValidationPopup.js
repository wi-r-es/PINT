import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EventValidationPopup.css";
import MapComponent from "../../components/MapComponent/MapComponent";
import api from "../../api";

const EventValidationPopup = ({ show, handleClose, event, user, onValidate, onReject }) => {
  const [actualEvent, setActualEvent] = useState(null);
  useEffect(() => {
    if (event) {
      const fetchEventDetail = async () => {
        try {
          const response = await api.get(`/dynamic/get-event/${event.event_id}`);
          setActualEvent(response.data.data.event_);
        } catch (error) {
          console.error("Error fetching event detail", error);
        }
      };
      fetchEventDetail();
    }
  }, [event]);

  const handleValidate = async () => {
    try {
      await api.patch(
        `/administration/validate-content/event/${actualEvent.event_id}/${user.user_id}`,
        {}
      );
      onValidate(actualEvent.event_id);  // Call the passed validation function
      handleClose();
    } catch (error) {
      console.error("Error validating event", error);
    }
  };

  const handleReject = async () => {
    try {
      await api.patch(
        `/administration/reject-content/event/${actualEvent.event_id}/${user.user_id}`,
        {}
      );
      onReject(actualEvent.event_id); // Call the passed reject function
      handleClose();
    } catch (error) {
      console.error("Error rejecting event", error);
    }
  };

  if (!actualEvent) {
    return null; // If event details are not fetched yet, don't render the popup
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton className="custom-modal-content">
        <Modal.Title>Event Validation</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-content">
        <div className="post-detail">
          <div className="post-header">
            <h2>{actualEvent.name}</h2>
          </div>
          <div className="post-content">
            <p>{actualEvent.description}</p>
            {actualEvent.filepath && (
              <img
                className="post-image"
                loading="lazy"
                alt={actualEvent.title}
                src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${actualEvent.filepath}`}
              />
            )}
          </div>
          <div className="post-footer">
            {actualEvent.SubArea && (
              <p>
                <strong>Sub Area:</strong> {actualEvent.SubArea.title}
              </p>
            )}
            {actualEvent.price && (
              <p>
                <strong>Price:</strong> {actualEvent.price}
              </p>
            )}
            {actualEvent.event_location && (
              <>
                <p>
                  <strong>Location:</strong> {actualEvent.event_location}
                </p>
                <MapComponent location={actualEvent.event_location} />
              </>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="custom-modal-content">
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="danger" onClick={handleReject}>
          Reject
        </Button>
        <Button variant="primary" onClick={handleValidate}>
          Validate
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EventValidationPopup;
