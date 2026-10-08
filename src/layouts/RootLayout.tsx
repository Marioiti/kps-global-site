import { Outlet } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

/** App-wide providers shared by every route. */
const RootLayout = () => (
  <LanguageProvider>
    <Outlet />
  </LanguageProvider>
);

export default RootLayout;
