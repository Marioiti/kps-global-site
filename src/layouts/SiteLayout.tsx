import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/** Header, page area and footer shared by every page except the 404. */
const SiteLayout = () => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <ScrollRestoration />
  </div>
);

export default SiteLayout;
