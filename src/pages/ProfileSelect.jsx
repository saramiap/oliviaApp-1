import { useNavigate } from "react-router-dom";


const profiles = [
  {
    name: "Olivia",
    role: "Psychologie & bien-être",
    avatar: "../../public/olivia.jpg",
    description: "Empathique, calme, douce – là pour t’écouter.",
  },
  {
    name: "Podcasta",
    role: "Podcast",
    avatar: "../../public/podcastImage.jpg",
    description: "Un podcast de boost chaque jour pour avancer !",
  },
  {
    name: "Detenta",
    role: "Détente",
    avatar: "../../public/detenteImage.jpg",
    description: "Un moment pour respirer et se relaxer.",
  },
  {
    name: "Psycholib",
    role: "Des professionnel de santé",
    avatar: "../../public/santéImage.jpg",
    description: "un psychologue, un psychiatre ou encore psychotérapeute?",
  },
];

export default function ProfileSelect() {
  const navigate = useNavigate();

  const handleSelect = (profile) => {
    localStorage.setItem("selectedProfile", JSON.stringify(profile));
  
    // Redirection conditionnelle selon le nom
    switch (profile.name) {
      case "Olivia":
        navigate("/chat");
        break;
      case "Podcasta":
        navigate("/podcast");
        break;
      case "detenta":
        navigate("/detente");
        break;
      case "Psycholib":
        navigate("/sante");
        break;
      default:
        navigate("/chat"); // fallback
    }
  };
  

  return (
    <div className="profile-select">
      <h1>Que veux-tu aujourd’hui ?</h1>
      <div className="profiles">
        {profiles.map((p, idx) => (
          <div key={idx} className="profile-card" onClick={() => handleSelect(p)}style={{ backgroundImage: `url(${p.avatar})` }}>
            <img src={p.avatar} alt={p.name} />
            <h2>{p.name}</h2>
            <p>{p.role}</p>
            <small>{p.description}</small>
          </div>
        ))}
      </div>
    </div>
  );
}  
