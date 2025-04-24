import "../styles/PractitionerCard.scss";


const PractitionerCard = ({ practitioner }) => (
    <div className="card">
      <img src={practitioner.image} alt={practitioner.name} />
      <h3>{practitioner.name}</h3>
      <p><strong>{practitioner.specialty}</strong></p>
      <p>{practitioner.location}</p>
      <p>{practitioner.consultation}</p>
      <button>Prendre rendez-vous</button>
    </div>
  );
  
  export default PractitionerCard;
  