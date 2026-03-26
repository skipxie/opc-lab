import { Outlet } from "react-router-dom";

import Footer from "@/components/site/Footer";
import TopNav from "@/components/site/TopNav";
import ToastHost from "@/components/ui/ToastHost";

export default function SiteLayout() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="pt-16">
        <Outlet />
      </div>
      <Footer />
      <ToastHost />
    </div>
  );
}
