import { useEffect, useState } from "react";

const phrases = [
  "LAND THE ROLE.",
  "GRAB YOUR DREAM.",
  "LEARN FROM MISTAKES.",
  "ALL IN ONE PLATFORM.",
  "AI ANALYSIS.",
  "BEST ROLES FOR YOU.",
];

const INTERVAL_MS = 3000;

const RotatingText = ({ className = "" }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`inline-block ${className}`}>
      <span key={index} className="inline-block animate-text-swap">
        {phrases[index]}
      </span>
    </span>
  );
};

export default RotatingText;
