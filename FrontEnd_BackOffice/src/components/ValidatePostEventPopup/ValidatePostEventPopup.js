import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ValidateItemPopup = ({ show, handleClose, handleValidate }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Validate Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to validate this post?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleValidate}>
          Validate
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ValidateItemPopup;
