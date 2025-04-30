import { useState } from "react";
import practitioners from "../data/practitioners";
import PractitionerCard from "../components/PractitionerCard";



const Sante = () => {
  const [search, setSearch] = useState("");

  const filtered = practitioners.filter((p) =>
    p.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sante-page">
      <h1>Les professionnels de santé</h1>
      <input
        type="text"
        placeholder="Rechercher par spécialité..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="card-list">
        {filtered.map((p) => (
          <PractitionerCard key={p.id} practitioner={p} />
        ))}
      </div>
    </div>
  );
};

export default Sante;
