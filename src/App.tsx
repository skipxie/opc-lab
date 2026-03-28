import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import Community from "@/pages/Community";
import Home from "@/pages/Home";
import PolicyMap from "@/pages/PolicyMap";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/policy-map" element={<PolicyMap />} />
          <Route path="/community" element={<Community />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
