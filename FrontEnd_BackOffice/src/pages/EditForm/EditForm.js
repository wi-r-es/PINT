import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Modal, InputGroup } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Navbar from "../../components/Navbar/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import './EditForm.css';
import api from "../../api";
import { useLocation } from 'react-router-dom';

const EditForm = () => {
    const location = useLocation();
    const event = location.state?.event || {};

    useEffect(() => {
        document.title = `Edit Form ${event.name || ""}`;

        const getFormFields = async () => {
            try {
                const res = await api.get(`/form/event-form/${event.event_id}`);
                const formFields = res.data.data;
                setFormFields(formFields);
                console.log("Form fields:", formFields);
            } catch (error) {
                console.error("Error fetching form fields:", error);
            }
        }

        getFormFields();
    }, [event]);

    const [formFields, setFormFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [newField, setNewField] = useState({ type: "", name: "", options: [] });
    const [jsonForm, setJsonForm] = useState([]);
    const [fieldsAdded, setFieldsAdded] = useState([]);
    const [fieldsDeleted, setFieldsDeleted] = useState([]);

    const addInfo = (label, options, type, id) => {
        const obj = {
            field_id: id,
            field_name: label,
            field_type: type,
            field_value: JSON.stringify(options || []),
            max_value: null,
            min_value: null
        };
        setJsonForm(prevJsonForm => [...prevJsonForm, obj]);
    };

    const handleShowModal = (type) => {
        const allowedTypes = ["Text", "Number", "Radio", "Checkbox"];
        if (!allowedTypes.includes(type)) {
            alert("Invalid field type.");
            return;
        }
        setNewField({ type, name: "", options: type === "Radio" ? ["Option 1"] : [] });
        setShowModal(true);
    };

    const handleAddField = () => {
        if (!newField.name.trim()) {
            alert("Field name is required");
            return;
        }
        
        const allowedTypes = ["Radio", "Checkbox", "Text", "Number"];
        if (!allowedTypes.includes(newField.type)) {
            alert(`Invalid field type: ${newField.type}.`);
            return;
        }
    
        // Create the fieldToAdd object based on the structure you need
        const fieldToAdd = {
            event_id: event.event_id,           // Add event_id from the event
            field_id: Date.now(),               // Generate a unique ID for the field
            def_field_id: null,                 // This is set to null as per your example
            field_name: newField.name,          // Set field_name from the newField state
            field_type: newField.type,          // Set field_type from the newField state
            field_value: JSON.stringify(newField.options || []), // Defaulting to empty array
            max_value: null,                    // Set to null (as per your example)
            min_value: null                     // Set to null (as per your example)
        };
    
        console.log("Adding field:", fieldToAdd);
    
        // Update formFields with the new field
        setFormFields(prevFields => [...prevFields, fieldToAdd]);
    
        // Update fieldsAdded array with the new field's ID
        setFieldsAdded(prevFieldsAdded => [...prevFieldsAdded, fieldToAdd.field_id]);
    
        // Update jsonForm to include the new field in JSON format
        addInfo(newField.name, newField.options, newField.type, fieldToAdd.field_id);
    
        // Close the modal after adding the field
        handleCloseModal();
    };
    
    

    const handleDeleteField = async (id) => {
        console.log(`Deleting field with id ${id}`);
    
        // Remove the field from the formFields state
        setFormFields(prevFields => prevFields.filter(field => field.field_id !== id));
    
        // Add the deleted field's ID to fieldsDeleted
        setFieldsDeleted(prevFieldsDeleted => [...prevFieldsDeleted, id]);
    
        // If the field was added in this session (exists in fieldsAdded), remove it from fieldsAdded
        setFieldsAdded(prevFieldsAdded => prevFieldsAdded.filter(fieldId => fieldId !== id));
    };

    const handleCloseModal = () => setShowModal(false);

    const handleInputChange = (id, value, type) => {
        setFormData(prevData => ({
            ...prevData,
            [id]: {
                value: value,
                type: type
            }
        }));
    };

    const handleRadioOptionChange = (optionIndex, value) => {
        setNewField(prevField => ({
            ...prevField,
            options: prevField.options.map((opt, idx) => idx === optionIndex ? value : opt)
        }));
    };

    const handleAddRadioOption = () => {
        setNewField(prevField => ({
            ...prevField,
            options: [...prevField.options, `Option ${prevField.options.length + 1}`]
        }));
    };

    const handleSetName = (name) => {
        setNewField(prevField => ({ ...prevField, name }));
    };

    const createF = async (events) => {
        events.preventDefault();
        try {
            console.log("event", event.event_id);
            const customFieldsJson = JSON.stringify(jsonForm);
            
            // Check if fields were added
            if (fieldsAdded.length > 0) {
                console.log("Fields Added:", fieldsAdded.length);
    
                const res = await api.post(`/form/add-fields-to-form/event/${event.event_id}/fields/${customFieldsJson}`, {
                    eventID: event.event_id,
                    customFieldsJson,
                    fieldsAdded // Passing the added fields
                });
                console.log("Response from server (fields added):", res.data);
            } else {
                console.log("No fields added.");
            }
    
            // Check if fields were deleted
            if (fieldsDeleted.length > 0) {
                console.log("Fields deleted:", fieldsDeleted);
    
                // Assuming there's a separate API to handle field deletions
               fieldsDeleted.forEach(async (fieldId) => {
                    const res2 = await api.delete(`/form/delete-field/${event.event_id}/${fieldId}`);
                    console.log("Response from server (fields deleted):", res2.data);
               });
                
            } else {
                console.log("No fields deleted.");
            }
            
        } catch (error) {
            console.error("Error processing form:", error);
        }
    };
    

    return (
        <div>
            <Navbar />
            <div className="container mt-4 down">
                <h1>{event.name}</h1>
                <DropdownButton id="dropdown-basic-button" title="Add a field">
                    <Dropdown.Item onClick={() => handleShowModal("Text")}>Text Field</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleShowModal("Number")}>Numeric Field</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleShowModal("Radio")}>Radio Button Group</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleShowModal("Checkbox")}>Checkbox</Dropdown.Item>
                </DropdownButton>

                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add {newField.type.charAt(0).toUpperCase() + newField.type.slice(1)} Field</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Field Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter field name"
                                value={newField.name}
                                onChange={(e) => handleSetName(e.target.value)}
                            />
                        </Form.Group>
                        {newField.type === "Radio" && (
                            <div>
                                <Form.Label>Radio Options</Form.Label>
                                {newField.options.map((option, optionIndex) => (
                                    <InputGroup className="mb-2" key={optionIndex}>
                                        <Form.Control
                                            type="text"
                                            placeholder={`Option ${optionIndex + 1}`}
                                            value={option}
                                            onChange={(e) => handleRadioOptionChange(optionIndex, e.target.value)}
                                        />
                                    </InputGroup>
                                ))}
                                <Button variant="secondary" onClick={handleAddRadioOption}>
                                    Add Option
                                </Button>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleAddField}>
                            Add Field
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Form className="mt-4" onSubmit={createF}>
                    {formFields.map((field) => (
                        <div key={field.field_id} className="mb-4">
                            {field.field_type === "Text" && (
                                <Form.Group as={Row} controlId={`text-${field.id}`}>
                                    <Form.Label column sm={2}>{field.field_name || "Text Field"}:</Form.Label>
                                    <Col sm={8}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter text"
                                            value={formData[field.id]?.value || ""}
                                            onChange={(e) => handleInputChange(field.id, e.target.value, 'text')}
                                        />
                                    </Col>
                                    <Col sm={2}>
                                        <Button variant="danger" onClick={() => handleDeleteField(field.field_id)}>Delete</Button>
                                    </Col>
                                </Form.Group>
                            )}
                            {field.field_type === "Number" && (
                                <Form.Group as={Row} controlId={`number-${field.id}`}>
                                    <Form.Label column sm={2}>{field.field_name || "Numeric Field"}:</Form.Label>
                                    <Col sm={8}>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter a number"
                                            value={formData[field.id]?.value || ""}
                                            onChange={(e) => handleInputChange(field.id, e.target.value, 'number')}
                                        />
                                    </Col>
                                    <Col sm={2}>
                                        <Button variant="danger" onClick={() => handleDeleteField(field.field_id)}>Delete</Button>
                                    </Col>
                                </Form.Group>
                            )}
                            {field.field_type === "Checkbox" && (
                                <Form.Group as={Row} controlId={`checkbox-${field.id}`}>
                                    <Col sm={8} offset={2}>
                                        <Form.Check
                                            type="checkbox"
                                            label={field.field_name || "Checkbox"}
                                            checked={formData[field.id]?.value || false}
                                            onChange={(e) => handleInputChange(field.id, e.target.checked, 'checkbox')}
                                        />
                                    </Col>
                                    <Col sm={2}>
                                        <Button variant="danger" onClick={() => handleDeleteField(field.field_id)}>Delete</Button>
                                    </Col>
                                </Form.Group>
                            )}
                            {field.field_type === "Radio" && (
                                <Form.Group as={Row} controlId={`radio-${field.id}`}>
                                    <Form.Label as="legend" column sm={2}>
                                        {field.field_name || "Radio Buttons"}:
                                    </Form.Label>
                                    <Col sm={8}>
                                        {JSON.parse(field.field_value).map((option, optionIndex) => (
                                            <Form.Check
                                                type="radio"
                                                label={option}
                                                name={`radio-${field.id}`}
                                                value={option}
                                                checked={formData[field.id]?.value === option}
                                                onChange={(e) => handleInputChange(field.id, e.target.value, 'radio')}
                                                key={optionIndex}
                                            />
                                        ))}
                                    </Col>
                                    <Col sm={2}>
                                        <Button variant="danger" onClick={() => handleDeleteField(field.field_id)}>Delete</Button>
                                    </Col>
                                </Form.Group>
                            )}
                        </div>
                    ))}
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default EditForm;
