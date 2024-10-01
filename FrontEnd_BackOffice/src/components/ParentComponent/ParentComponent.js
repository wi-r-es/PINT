import React, { useState } from "react";
import UserComponent from "../UserComponent/UserComponent"; // Adjust the import path as needed
import ValidateItemPopup from "../ValidateItem/ValidateItemPopup"; // Adjust the import path as needed
const ParentComponent = ({id, name, picture = null, email }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    return (
        <div>
            <UserComponent name={name} onClick={handleOpenPopup}  />
            {isPopupOpen && <ValidateItemPopup onClose={handleClosePopup}id={id} name={name} picture={picture} email={email} />}
        </div>
    );
};

export default ParentComponent;
