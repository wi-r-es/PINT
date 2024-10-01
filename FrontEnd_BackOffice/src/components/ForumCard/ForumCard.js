import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Dropdown, Modal, Button, Form } from 'react-bootstrap';
import "./ForumCard.css";
import Swal from 'sweetalert2';

const Card = ({ id = null, title = null, content = null, onValidate = false, showOptions = false }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [subAreaList, setSubAreaList] = useState([]);
  const [selectedSubArea, setSelectedSubArea] = useState(null);
  const [thisForum, setThisForum] = useState({});
  
  useEffect(() => {
    const fetchForum = async () => {
      try {
        const response = await api.get(`/dynamic/get-forum/${id}`);
        const forumData = response.data;
        setThisForum(forumData);
        setEditTitle(forumData.title);
        setEditContent(forumData.content);
        setSelectedSubArea(forumData.sub_area_id);
      } catch (error) {
        console.error("Error fetching forum", error);
      }
    };
    fetchForum();
  }, [id]);

  useEffect(() => {
    const fetchSubAreas = async () => {
      try {
        const response = await api.get('/categories/get-sub-areas');
        setSubAreaList(response.data.data);
      } catch (error) {
        console.error('Error fetching sub-areas:', error);
      }
    };

    fetchSubAreas();
  }, []);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleClose = () => {
    window.location.reload();
    setShowEditModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      // Logic to save changes, e.g., call an API to update the forum details
      const updatedForum = {
        title: editTitle,
        content: editContent,
        subAreaId: selectedSubArea,
      };
      await api.patch(`/forum/edit/${id}`, updatedForum);



      Swal.fire({
        icon: "success",
        title: "Forum updated successfully!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        handleClose();
      });
    } catch (error) {
      console.error("Error validating event", error);
    }
  };

  return (
    <div className="cardF">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title">{thisForum.title}</h5>
        </div>
        <p className="card-text">{thisForum.content}</p>
        <a href={`/forum/${id}`} className="btn2">Go To →</a>
        {onValidate && (
          <button className="btn btn-primary softinsaBackColor mt-2" onClick={() => onValidate(id)}>
            Validate
          </button>
        )}
      </div>
      <div className="card-footer d-flex justify-content-between align-items-center">
        {showOptions && (
          <>
            <Dropdown>
              <Dropdown.Toggle variant="link" className="dropdown-toggle-no-caret">
                <i className="fas fa-ellipsis-v"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu">
                <Dropdown.Item className="EditDropdownItem" onClick={handleEditClick}>
                  <i className="fas fa-pencil-alt"></i> Edit
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <div className="ml-auto">
              <small className="text-muted">
                {thisForum.PublisherFirstName} {thisForum.PublisherLastName}
              </small>
            </div>
          </>
        )}
        {!showOptions && (
        <>
        <div className="ml-auto2">
          <small className="text-muted">
            {thisForum.PublisherFirstName} {thisForum.PublisherLastName}
          </small>
        </div>
      </>
        )}
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Forum</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formEditTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formEditContent" className="mt-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formArea" className="mt-3">
              <Form.Label>Sub Area</Form.Label>
              <Form.Select
                value={selectedSubArea}
                onChange={(e) => setSelectedSubArea(e.target.value)}
              >
                <option value="" disabled>Select Sub Area</option>
                {subAreaList.map((subarea) => (
                  <option key={subarea.sub_area_id} value={subarea.sub_area_id}>
                    {subarea.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

Card.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  content: PropTypes.string,
  onValidate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  showOptions: PropTypes.bool,
};

Card.defaultProps = {
  onValidate: false,
  showOptions: false,
};

export default Card;
