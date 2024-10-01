import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PostValidationPopup.css";
import MapComponent from "../../components/MapComponent/MapComponent";
import api from "../../api";

const PostValidationPopup = ({ show, handleClose, post, user, onValidate, onReject }) => {
  const [actualPost, setActualPost] = useState(null);

  useEffect(() => {
    if (post) {
      const fetchPostDetail = async () => {
        try {
          const response = await api.get(`/dynamic/get-post/${post.post_id}`);
          setActualPost(response.data);
        } catch (error) {
          console.error("Error fetching post detail", error);
        }
      };
      fetchPostDetail();
    }
  }, [post]);

  const handleValidate = async () => {
    try {
      await api.patch(
        `/administration/validate-content/post/${actualPost.post_id}/${user.user_id}`,
        {}
      );
      onValidate(actualPost.post_id); // Call the passed validation function
      handleClose();
    } catch (error) {
      console.error("Error validating post", error);
    }
  };

  const handleReject = async () => {
    try {
      await api.patch(
        `/administration/reject-content/post/${actualPost.post_id}/${user.user_id}`,
        {}
      );
      onReject(actualPost.post_id); // Call the passed reject function
      handleClose();
    } catch (error) {
      console.error("Error rejecting post", error);
    }
  };

  if (!actualPost) {
    return null; // If post details are not fetched yet, don't render the popup
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton className="custom-modal-content">
        <Modal.Title>Publication Validation</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-content">
        <div className="post-detail">
          <div className="post-header">
            <h2>{actualPost.title}</h2>
          </div>
          <div className="post-content">
            <p>{actualPost.content}</p>
            {actualPost.filepath && (
              <img
                className="post-image"
                loading="lazy"
                alt={actualPost.title}
                src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${actualPost.filepath}`}
              />
            )}
          </div>
          <div className="post-footer">
            {actualPost.SubArea && (
              <p>
                <strong>Sub Area:</strong> {actualPost.SubArea.title}
              </p>
            )}
            {actualPost.price && (
              <p>
                <strong>Price:</strong> {actualPost.price}
              </p>
            )}
            {actualPost.p_location && (
              <>
                <p>
                  <strong>Location:</strong> {actualPost.p_location}
                </p>
                <MapComponent location={actualPost.p_location} />
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

export default PostValidationPopup;
