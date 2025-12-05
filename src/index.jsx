import React from "react"
import ReactDOM from "react-dom/client"
import './index.css'; // Import your main CSS file for Tailwind
import App from "./App.jsx"
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  
    <AuthProvider>
      <App />
    </AuthProvider>
  
)
