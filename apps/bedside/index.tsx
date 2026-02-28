// apps/bedside/index.tsx
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to fetch /hello"));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Bedside Nurse SPA</h1>
      <p>{message}</p>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
