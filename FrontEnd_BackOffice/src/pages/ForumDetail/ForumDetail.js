import React, { useState, useEffect } from "react";
import api from "../../api";
import Navbar from "../../components/Navbar/Navbar";
import { useParams } from "react-router-dom";
import "./ForumDetail.css";
import Authentication from "../../Auth.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

const ForumDetail = () => {
  const { forum_id } = useParams();
  const [forumMessages, setForumMessages] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [likes, setLikes] = useState([]);
  const [error, setError] = useState(null);
  const [state, setState] = useState(false);

  useEffect(() => {
    document.title = "SoftShares - Forum Detail";

    const checkCurrentUser = async () => {
      try {
        const res = await Authentication.getCurrentUser();
        if (res) {
          setUser(res.user);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    checkCurrentUser();
  }, []);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await api.get("/dynamic/get-users");
        setAllUsers(response.data.data);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchForum = async () => {
      try {
        const response = await api.get(`/dynamic/get-forum/${forum_id}`);
        setState(response.data.forum_status);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAllUsers();
    fetchForum();
  }, []);

  useEffect(() => {
    const fetchForumMessages = async () => {
      try {
        const response = await api.get(
          `/comment/get-comment-tree/content/forum/id/${forum_id}`
        );
        // Sort comments by date
        const sortedMessages = response.data.data.sort(
          (a, b) => new Date(b.comment_date) - new Date(a.comment_date)
        );
        setForumMessages(sortedMessages);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchForumMessages();
  }, [forum_id]);

  useEffect(() => {
    if (user) {
      const fetchLikes = async () => {
        try {
          const response = await api.get(
            `/comment/get-likes-per-user/${user.user_id}`
          );
          setLikes(response.data.data);
        } catch (error) {
          setError(error.message);
        }
      };

      fetchLikes();
    }
  }, [user]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post("/comment/add-comment", {
        contentID: forum_id,
        contentType: "Forum",
        userID: user.user_id,
        commentText: newComment,
      });

      setNewComment("");

      // Refresh comments
      const response = await api.get(
        `/comment/get-comment-tree/content/forum/id/${forum_id}`
      );
      const sortedMessages = response.data.data.sort(
        (a, b) => new Date(b.comment_date) - new Date(a.comment_date)
      );
      setForumMessages(sortedMessages);
    } catch (error) {
      alert("Failed to send comment:", error.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      alert("You need to be logged in to like a comment.");
      return;
    }

    const isLiked = likes.find((like) => like.comment_id === commentId);

    // Optimistically update UI
    setLikes((prevLikes) =>
      isLiked
        ? prevLikes.filter((like) => like.comment_id !== commentId)
        : [...prevLikes, { comment_id: commentId }]
    );

    try {
      if (isLiked) {
        await api.patch("/comment/remove-like", {
          commentID: commentId,
        });
      } else {
        await api.post("/comment/add-like", {
          commentID: commentId,
        });
      }
    } catch (error) {
      console.error("Failed to update like status:", error);
      alert("Failed to update like status. Please try again later.");
      // Revert UI update if request fails
      setLikes((prevLikes) =>
        isLiked
          ? [...prevLikes, { comment_id: commentId }]
          : prevLikes.filter((like) => like.comment_id !== commentId)
      );
    }
  };

  const findUserById = (userId) => {
    const foundUser = allUsers.find((user) => user.user_id === userId);

    return foundUser
      ? `${foundUser.first_name} ${foundUser.last_name}`
      : "Unknown User";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendComment();
    }
  };

  return (
    <>
      <Navbar />
      <div className="forum">
        <div className="chat-container">
          <div className="messages">
            {forumMessages.map((comment) => (
              <div key={comment.comment_id} className="message">
                <p>
                  <strong>{findUserById(comment.publisher_id)}:</strong>{" "}
                  {comment.content}
                  <span
                    onClick={() => handleLikeComment(comment.comment_id)}
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                  >
                    <FontAwesomeIcon
                      icon={faThumbsUp}
                      style={{
                        color: likes.find(
                          (like) => like.comment_id === comment.comment_id
                        )
                          ? "blue"
                          : "black",
                      }}
                    />
                  </span>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ForumDetail;
