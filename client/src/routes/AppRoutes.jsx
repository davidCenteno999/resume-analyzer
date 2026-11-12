import { Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UploadPdf from "../pages/UploadPdf";
import History from "../pages/History";
import AnalysisResults from "../pages/AnalysisResults";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/upload" element={
        <ProtectedRoute>
          <UploadPdf />
        </ProtectedRoute>
      } />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/analyses/:analysisId" element={<ProtectedRoute><AnalysisResults /></ProtectedRoute>} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
