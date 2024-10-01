import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./PostDetail.css";
import Authentication from "../../Auth.service";
import Navbar from "../../components/Navbar/Navbar";
import MapComponent from "../../components/MapComponent/MapComponent";

const PostDetail = () => {
  const { post_id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("post");

  useEffect(() => {
    document.title = "SoftShares - Post Detail";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(JSON.stringify(res.token));
        setUser(res.user);
      }
    };

    checkCurrentUser();
  }, []);

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!token) return;

      try {
        const response = await api.get(`/dynamic/get-post/${post_id}`);
        setPost(response.data);
        console.log(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!token) return;

      try {
        const response = await api.get(`/comment/get-comment-tree/content/post/id/${post_id}`);
        setComments(response.data.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPostDetail();
    fetchComments();

    const interval = setInterval(() => {
      fetchComments();
    }, 3000); // Reload every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [post_id, token]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!token) return;

      try {
        const response = await api.get("/dynamic/get-users");
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
        contentID: post_id,
        contentType: "Post",
        userID: user.user_id,
        commentText: newComment,
      });
      setNewComment("");
      // Refresh comments
      const response = await api.get(`/comment/get-comment-tree/content/post/id/${post_id}`);
      setComments(response.data.data);
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
    console.log(user);
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
              className={`nav-link ${activeTab === "post" ? "active" : ""}`}
              href="#"
              onClick={() => setActiveTab("post")}
            >
              Post
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === "comments" ? "active" : ""}`}
              href="#"
              onClick={() => setActiveTab("comments")}
            >
              Comments
            </a>
          </li>
        </ul>

        {activeTab === "post" && post && (
          <div className="post-detail">
            <div className="post-header">
              <h2>{post.title}</h2>
              <p className="text-muted">
                Posted by {post.PublisherFirstName} {post.PublisherLastName}{" "}
                {new Date(post.creation_date).toLocaleString()}
              </p>
            </div>
            <div className="post-content">
              <p>{post.content}</p>
              {post.filepath && (
                <img
                  className="post-image"
                  loading="lazy"
                  alt={post.title}
                  src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/${post.filepath}`}
                />
              )}
            </div>
            <div className="post-footer">
              <p>
                <strong>Sub Area:</strong> {post.SubAreaTitle}
              </p>
              {post.price && (
                <p>
                  <strong>Price:</strong> {post.price}
                </p>
              )}
              {post.p_location && (
                <>
                  <p>
                    <strong>Location:</strong> {post.p_location}
                  </p>
                  <MapComponent location={post.p_location} />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="forum">
            <h2>Comments</h2>
            <div className="chat-container">
              <div className="messages">
                {comments.map((comment) => (
                  <div key={comment.comment_id} className="message">
                    <p>
                      <strong>{findUserById(comment.publisher_id)}:</strong>{" "}
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button type="button" onClick={handleSendComment}>
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PostDetail;
