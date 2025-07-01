import React from 'react';
import ConstructionPage from '../components/ConstructionPage'; // Ajuste le chemin si besoin
import { Stethoscope } from 'lucide-react';

const Sante = () => {
  // Pour l'instant, on affiche juste la page "en cours de création".
  // Tu pourras décommenter et réutiliser ton code original quand la page sera prête.
  
  return (
    <ConstructionPage 
      pageName="Santé" 
      featureDescription="de nouveau partenaria."
      IconComponent={Stethoscope} 
    />
    
  );
};

export default Sante;


// import { useState } from "react";
// import practitioners from "../data/practitioners";
// import PractitionerCard from "../components/PractitionerCard";



// const Sante = () => {
//   const [search, setSearch] = useState("");

//   const filtered = practitioners.filter((p) =>
//     p.specialty.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="sante-page">
//       <h1>Les professionnels de santé</h1>
//       <input
//         type="text"
//         placeholder="Rechercher par spécialité..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />
//       <div className="card-list">
//         {filtered.map((p) => (
//           <PractitionerCard key={p.id} practitioner={p} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Sante;
