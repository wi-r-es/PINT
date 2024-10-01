import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import MapComponent from "../../components/MapComponent/MapComponent";
import api from "../../api";
import "./EventValidationPopup.css"; // Import custom CSS file
import Swal from "sweetalert2";

const EventValidationPopup = ({ show, handleClose, forum, user }) => {
  const [actualForum, setActualForum] = useState(null);

  useEffect(() => {
    if (forum) {
      const fetchEventDetail = async () => {
        try {
          const response = await api.get(`/dynamic/get-forum/${forum.forum_id}`);
          setActualForum(response.data);
        } catch (error) {
          console.error("Error fetching event detail", error);
        }
      };
      fetchEventDetail();
    }
  }, [forum]);

  const handleValidate = async () => {
    try {
      await api.patch(
        `/administration/validate-content/forum/${actualForum.forum_id}/${user.user_id}`,
        {}
      );
  
      Swal.fire({
        icon: "success",
        title: "Forum validated successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        handleClose();
      });
    } catch (error) {
      console.error("Error validating event", error);
    }
  };
  
  const handleReject = async () => {
    try {
      await api.patch(
        `/administration/reject-content/forum/${actualForum.forum_id}/${user.user_id}`,
        {}
      );
  
      Swal.fire({
        icon: "success",
        title: "Forum rejected successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        handleClose();
      });
    } catch (error) {
      console.error("Error rejecting event", error);
    }
  };
  

  if (!actualForum) {
    return null; // If event details are not fetched yet, don't render the popup
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title>Forum Validation</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-body">
        <div className="post-detail">
          <div className="post-header">
            <h2>{actualForum.title}</h2>
          </div>
          <div className="post-content">
            <p><strong>Content:</strong> {actualForum.content}</p>
          </div>
          <div className="post-footer">
            {actualForum.SubAreaTitle && (
              <p>
                <strong>Sub Area:</strong> {actualForum.SubAreaTitle}
              </p>
            )}
            {actualForum.price && (
              <p>
                <strong>Price:</strong> {actualForum.price}
              </p>
            )}
            {actualForum.event_location && (
              <>
                <p>
                  <strong>Location:</strong> {actualForum.event_location}
                </p>
                <MapComponent location={actualForum.event_location} />
              </>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="custom-modal-footer">
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
