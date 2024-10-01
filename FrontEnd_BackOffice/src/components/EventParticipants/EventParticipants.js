import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventParticipant.css';

import api from '../../api';
const EventParticipantComponent = ({ EventID, token }) => {
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                // const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/event/get-participants/${EventID}`, {
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                const response = await api.get(`/event/get-participants-adm/${EventID}`);
                console.log(response.data);
                setParticipants(response.data.data);
                setFilteredParticipants(response.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchParticipants();
    }, [EventID, token]);

    useEffect(() => {
        const filtered = participants.filter(participant =>
            `${participant.first_name} ${participant.last_name}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
        console.log(filtered);
        setFilteredParticipants(filtered);
    }, [search, participants]);

    return (
        <div className="card participant-container">
            <h2 className="card-title">Participants</h2>
            <input
                type="text"
                placeholder="Search by name"
                className="form-control mb-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <ul className="list-group list-group-flush participant-list">
                {filteredParticipants.length === 0 ? (
                    <li className="list-group-item">No participants found.</li>
                ) : (
                    filteredParticipants.map((participant) => (
                        <li key={participant.user_id} className="list-group-item participant-item d-flex justify-content-between align-items-center area-item">
                            <span>{participant.first_name} {participant.last_name}</span>
                            <img
                                src={participant.profile_pic ? `${process.env.REACT_APP_BACKEND_URL}/api/uploads/${participant.profile_pic}` : '/assets/user.png'}
                                alt={`${participant.first_name} ${participant.last_name}`}
                                className="participant-pic"
                                style={{ width: '40px', height: '40px' }}
                            />
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default EventParticipantComponent;
