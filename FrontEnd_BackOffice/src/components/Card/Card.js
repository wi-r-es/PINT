import PropTypes from 'prop-types';
import "./Card.css";

const Card = ({ className = "", imagealt, imagePlaceholderChangeIma, content }) => {
  return (
    <div className={`card2 ${className}`}>
      <img
        className="card-img-top"
        loading="lazy"
        alt={imagealt}
        src={imagePlaceholderChangeIma}
      />
      <div className="card-body">
        <h5 className="card-title">{content}</h5>
      </div>
    </div>
  );
};

Card.propTypes = {
  className: PropTypes.string,
  imagePlaceholderChangeIma: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default Card;
