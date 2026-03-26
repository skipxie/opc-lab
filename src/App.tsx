import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import Community from "@/pages/Community";
import Home from "@/pages/Home";
import PolicyMap from "@/pages/PolicyMap";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/policy-map" element={<PolicyMap />} />
          <Route path="/community" element={<Community />} />
        </Route>
      </Routes>
    </Router>
  );
}
