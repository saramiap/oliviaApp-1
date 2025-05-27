// src/components/StressProgram/StressTracker.js
import React from 'react';

const StressTracker = ({ day }) => (
  <div className="stress-tracker">
    <p>Tu es au jour {day} sur 7</p>
    <progress max="7" value={day}></progress>
  </div>
);

export default StressTracker;