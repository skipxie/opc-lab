import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import Community from "@/pages/Community";
import Home from "@/pages/Home";
import PolicyMap from "@/pages/PolicyMap";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Article from "@/pages/Article";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminPolicies from "@/pages/admin/Policies";
import AdminArticles from "@/pages/admin/Articles";
import AdminArticleForm from "@/pages/admin/ArticleForm";
import AdminRoles from "@/pages/admin/Roles";
import AdminUsers from "@/pages/admin/Users";
import AdminPolicyForm from "@/pages/admin/PolicyForm";
import PolicyCrawler from "@/pages/admin/PolicyCrawler";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 前台路由 */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/policy-map" element={<PolicyMap />} />
          <Route path="/community" element={<Community />} />
          <Route path="/articles/:slug" element={<Article />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 管理后台路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="policies" element={<AdminPolicies />} />
          <Route path="policies/new" element={<AdminPolicyForm />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="articles/new" element={<AdminArticleForm />} />
          <Route path="articles/:id/edit" element={<AdminArticleForm />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="policy-crawler" element={<PolicyCrawler />} />
        </Route>
      </Routes>
    </Router>
  );
}
