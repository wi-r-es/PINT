import React, { useState, useEffect } from 'react';
import './Forms.css';
import Navbar from '../../components/Navbar/Navbar';
import api from '../../api';
import Authentication from '../../Auth.service';
import Swal from 'sweetalert2';  // Import Swal for alerts
import {
    Table,
    Container,
    Button,
    Row,
    Col,
    Modal // Import Modal from React-Bootstrap
} from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

const Forms = () => {
    const navigate = useNavigate();
    const [eventWithForm, setEventWithForm] = useState([]);
    const [user, setUser] = useState(null);  // Initialize user with null to avoid issues with undefined properties
    const [showModal, setShowModal] = useState(false);  // State to control modal visibility
    const [selectedEvent, setSelectedEvent] = useState(null); // Store the event for which the answers are being checked
    const [answers, setAnswers] = useState([]);  // Store the answers of the selected event

    useEffect(() => {
        document.title = "Forms";

        const checkCurrentUser = async () => {
            const res = await Authentication.getCurrentUser();
            if (res) {
                setUser(res.user);
            }
        };

        checkCurrentUser();
    }, []);

    // Fetch answers when selectedEvent is updated and modal is opened
    useEffect(() => {
        const fetchAnswers = async () => {
            if (!selectedEvent) return;

            try {
                const response = await api.get(`/form/get-event-answers-web/${selectedEvent.event_id}`);
                const answers = response.data.data;
                console.log(answers);

                setAnswers(answers);  // Set the answers for the selected event
            } catch (error) {
                console.error('Error fetching answers', error);
            }
        };

        if (selectedEvent) {
            fetchAnswers();
        }
    }, [selectedEvent]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/form/get-all-event-with-forms');
                const events = response.data.data;

                if (user?.office_id === 0) {
                    setEventWithForm(events);
                } else if (user?.office_id) {
                    setEventWithForm(events.filter(event => event.office_id === user.office_id));
                }
            } catch (error) {
                console.error('Error fetching events', error);
            }
        };

        if (user) {
            fetchEvents();
        }
    }, [user]);  // Add user as a dependency

    const handleEditClick = (event) => {
        console.log('Edit clicked for event', event);
        if (event.validated) {
            Swal.fire({
                title: "Warning",
                text: "You can not edit a validated form",
                icon: "warning",
            });
            return;
        }
        navigate('/edit-form', { state: { event } });
    };

    const handleCheckAnswersClick = (event) => {
        setSelectedEvent(event);  // Set the event to be shown in the modal
        setShowModal(true);  // Open the modal
    };

    const handleCloseModal = () => {
        setShowModal(false);  // Close the modal
        setSelectedEvent(null);  // Reset selected event
        setAnswers([]);  // Reset answers when modal is closed
    };

    return (
        <>
            <Navbar />
            <Container className="down mt-5">
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center">Forms</h1>
                    </Col>
                </Row>
                <Table
                    striped
                    bordered
                    hover
                    className="table-responsive"
                    style={{
                        borderColor: "#00b0ff",
                    }}
                >
                    <thead style={{ backgroundColor: "#00b0ff", color: "#fff" }}>
                        <tr>
                            <th>Event</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventWithForm.map((event) => (
                            <tr key={event.event_id}>
                                <td>{event.name}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        className="me-2"
                                        onClick={() => handleEditClick(event)}
                                        style={{
                                            backgroundColor: "#00b0ff",
                                            borderColor: "#00b0ff",
                                        }}
                                    >
                                        Edit Form
                                    </Button>
                                   <Button
                                        variant="primary"
                                        className="me-2"
                                        onClick={() => handleCheckAnswersClick(event)}  // Open modal on click
                                        style={{
                                            backgroundColor: "#00b0ff",
                                            borderColor: "#00b0ff",
                                        }}
                                    >
                                        Check Answers
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Modal for Checking Answers */}
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Check Answers for {selectedEvent?.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* Display the answers in the desired format */}
                        {answers.length > 0 ? (
                            <ul>
                                {answers.map((answer) => (
                                    <li key={answer.field_id}>
                                        {answer.first_name} {answer.last_name} answers {answer.field_name} with {answer.answer}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No answers available for this event.</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
};

export default Forms;
