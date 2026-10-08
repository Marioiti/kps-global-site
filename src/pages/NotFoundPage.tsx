import NotFound from "./NotFound";

/** The catch-all route (dist/404.html): the 404 content as the page's main landmark. */
const NotFoundPage = () => (
  <main>
    <NotFound />
  </main>
);

export default NotFoundPage;
