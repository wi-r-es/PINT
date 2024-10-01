import React from 'react';
import './LittleBox.css';

const LittleBox = ({ topText, bottomText }) => {
  return (
    <div className="little-box">
      <div className="little-box-top">
        {topText}
      </div>
      <div className="little-box-bottom">
        {bottomText}
      </div>
    </div>
  );
};

export default LittleBox;
