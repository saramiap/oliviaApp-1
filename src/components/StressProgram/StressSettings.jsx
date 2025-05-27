const StressSettings = ({ onSave }) => {
    const [goal, setGoal] = useState("betterSleep");
  
    return (
      <div>
        <h2>Quel est ton objectif principal ?</h2>
        <select value={goal} onChange={e => setGoal(e.target.value)}>
          <option value="betterSleep">Mieux dormir</option>
          <option value="reduceAnxiety">Réduire l’anxiété</option>
          <option value="focus">Améliorer la concentration</option>
        </select>
        <button onClick={() => onSave(goal)}>Sauvegarder</button>
      </div>
    );
  };
  