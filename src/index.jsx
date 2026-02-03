import React from "react"
import ReactDOM from "react-dom/client"
import './index.css'; // Import your main CSS file for Tailwind
import App from "./App.jsx"
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from "./context/ToastContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <ToastProvider>
    <AuthProvider>     
      <App />
    </AuthProvider>
    </ToastProvider>
  
)


