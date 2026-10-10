import { Link } from "react-router-dom";
import NotFound from "./NotFound";
import Seal from "@/components/v3/Seal";
import { canon } from "@/data/canon";

/** The catch-all route (dist/404.html): the seal and the name, then the 404 content as the main landmark. */
const NotFoundPage = () => (
  <>
    <header className="border-b border-border">
      <div className="page-container py-4 lg:py-[22px] flex items-center">
        <Link to="/" className="flex items-center gap-3 rounded-sm">
          <Seal size={36} />
          <span className="font-display text-[19px] sm:text-[21px] font-medium text-foreground">{canon.brand}</span>
        </Link>
      </div>
    </header>
    <main>
      <NotFound />
    </main>
  </>
);

export default NotFoundPage;
