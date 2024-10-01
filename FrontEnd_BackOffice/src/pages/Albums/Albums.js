import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import Authentication from "../../Auth.service";
import './Albums.css';

const AlbumsPage = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        document.title = "SoftShares - Albums";

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
        const fetchAlbums = async () => {
            if (!token) return;

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/media/get-albums`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                setAlbums(response.data.albums);
            } catch (error) {
                console.error(error);
            }
        };

        fetchAlbums();
    }, [token]);

    return (
        <>
            <Navbar />
            <div className="albums-container">
                <h1>Albums</h1>
                {albums.length > 0 ? (
                    <div className="albums-list">
                        {albums.map((album, index) => (
                           <a href={`/album/${album.album_id}`} className="album-item" >
                             <div key={index}>
                                <h2>{album.title}</h2>
                                <p>{album.description}</p>
                            </div>
                           </a>
                        ))}
                    </div>
                ) : (
                    <p>No albums found.</p>
                )}
            </div>
        </>
    );
};

export default AlbumsPage;
