import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./EventDetail.css";
import Authentication from "../../Auth.service";
import Navbar from "../../components/Navbar/Navbar";
import MapComponent from "../../components/MapComponent/MapComponent";
import EventParticipantComponent from "../../components/EventParticipants/EventParticipants";

const EventDetail = () => {
  const { event_id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [subAreas, setSubAreas] = useState([]);
  const [subArea, setSubArea] = useState("");
  const [forumComments, setForumComments] = useState([]);
  const [activeTab, setActiveTab] = useState("event");
  const [newComment, setNewComment] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [state, setState] = useState(false);

  useEffect(() => {
    document.title = "SoftShares - Event Detail";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(JSON.stringify(res.token));
        setUser(res.user);
      }
    };

    const fetchForum = async () => {
      try {
        const response = await api.get(`/dynamic/get-forum/${event_id}`);
        setState(response.data.forum_status);
      } catch (error) {
        setError(error.message);
      }
    };


    checkCurrentUser();
    fetchForum();
  }, []);

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!token) return;

      try {
        // const response = await axios.get(
        //   `${process.env.REACT_APP_BACKEND_URL}/api/dynamic/get-event/${event_id}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );
        const response = await api.get(`/dynamic/get-event/${event_id}`);
        setEvent(response.data.data.event_);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchForums = async () => {
      if (!token) return;

      try {
        const res = await api.get(`/dynamic/all-content`);
        // const res = await axios.get(
        //   `${process.env.REACT_APP_BACKEND_URL}/api/dynamic/all-content`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );
        console.log(res.data.forums);
        setForums(res.data.forums);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchSelectedForum = () => {
      if (!token) return;

      try {
        let array = [];
        forums.forEach((forum) => {
          if (forum.event_id !== null) {
            array.push(forum);
          }
        });
        let selectedForum = array.find(
          (forum) => forum.event_id === parseInt(event_id)
        );
        console.log(selectedForum);
        setSelectedForum(selectedForum);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEventDetail();
    fetchForums();
    fetchSelectedForum();
    console.log(forums);
  }, [event_id, token]);

  useEffect(() => {
    const fetchSubAreas = async () => {
      if (!token || !event) return;

      try {
        // const response = await axios.get(
        //   `${process.env.REACT_APP_BACKEND_URL}/api/categories/get-sub-areas`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );
        const response = await api.get("/categories/get-sub-areas");
        setSubAreas(response.data.data);
        const matchedSubArea = response.data.data.find(
          (subArea) => subArea.sub_area_id === event.sub_area_id
        );
        setSubArea(matchedSubArea ? matchedSubArea.title : "");
      } catch (error) {
        setError(error.message);
      }
    };

    fetchSubAreas();
  }, [event, token]);

  useEffect(() => {
    const fetchForumComments = async () => {
      if (!token || !event) return;

      try {
        const response = await api.get(
          `/comment/get-comment-tree/content/forum/id/${event_id}`
        );
        // const response = await axios.get(
        //   `${process.env.REACT_APP_BACKEND_URL}/api/comment/get-comment-tree/content/forum/id/${event_id}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );
        setForumComments(response.data.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchForumComments();

    const intervalId = setInterval(fetchForumComments, 3000);

    return () => clearInterval(intervalId);
  }, [token, event, event_id]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!token) return;

      try {
        const response = await api.get('/dynamic/get-users');
        // const response = await axios.get(
        //   `${process.env.REACT_APP_BACKEND_URL}/api/dynamic/get-users`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );
        setAllUsers(response.data.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAllUsers();
  }, [token]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post("/comment/add-comment", {
        contentID: event_id, // TODO: Replace with forum ID if needed
        contentType: "Forum",
        userID: user.user_id,
        commentText: newComment,
      });
      // await axios.post(
      //   `${process.env.REACT_APP_BACKEND_URL}/api/comment/add-comment`,
      //   {
      //     contentID: event_id, // TODO: Replace with forum ID if needed
      //     contentType: "Forum",
      //     userID: user.user_id,
      //     commentText: newComment,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      setNewComment("");
      // Refresh comments
      const response = await api.get(`/comment/get-comment-tree/content/forum/id/${event_id}`);
      // const response = await axios.get(
      //   `${process.env.REACT_APP_BACKEND_URL}/api/comment/get-comment-tree/content/forum/id/${event_id}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      setForumComments(response.data.data);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const findUserById = (userId) => {
    const user = allUsers.find((user) => user.user_id === userId);
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendComment();
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === "event" ? "active" : ""}`}
              href="#"
              onClick={() => setActiveTab("event")}
            >
              Event
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === "forum" ? "active" : ""}`}
              href="#"
              onClick={() => setActiveTab("forum")}
            >
              Forum
            </a>
          </li>
        </ul>

        {activeTab === "event" && event && (
          <div className="event-detail">
            <div className="event-header">
              <h2>{event.name}</h2>
              <p className="text-muted">
                Hosted by {findUserById(event.publisher_id)} on{" "}
                {new Date(event.event_date).toLocaleString()}
              </p>
            </div>
            <div className="event-content">
              <p>{event.description}</p>
              {event.filepath && (
                <img
                  className="event-image"
                  loading="lazy"
                  alt={event.name}
                  src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${event.filepath}`}
                />
              )}
            </div>
            <div className="event-footer">
              {subArea && (
                <p>
                  <strong>Sub Area:</strong> {subArea}
                </p>
              )}
              {event.event_location && (
                <>
                  <p>
                    <strong>Location:</strong> {event.event_location}
                  </p>
                  <MapComponent location={event.event_location} />
                </>
              )}
              {event.price && (
                <p>
                  <strong>Price:</strong> {event.price}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "forum" && (
          <div className="forum">
            <h2>Forum</h2>
            <div className="chat-container">
              <div className="messages">
                {forumComments.map((comment) => (
                  <div key={comment.comment_id} className="message">
                    <p>
                      <strong>{findUserById(comment.publisher_id)}:</strong>{" "}
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
              <div className="message-input">
              {state ? (
              <input
                type="text"
                placeholder="Type a message..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            ) : (
              <input
                type="text"
                placeholder="Type a message..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={true}
                title="Disabled"
              />
            )}
                <button type="button" onClick={handleSendComment}>
                  Send
                </button>
                <a className="btn btn-primary" href={`/forum/${event_id}`}>Go To Form</a>
              </div>
            </div>
          </div>
        )}
        <EventParticipantComponent EventID={event_id} token={token} />
      </div>
    </>
  );
};

export default EventDetail;
