import cheerio from 'cheerio';

const DEV = process.env.NODE_ENV !== 'production';

const setupAppRoutes = (app, devMiddleware, templateFile, sendFile) => {
  // development: serve everything through devMiddleware
  if (DEV) {
    app.get('*', (req, res, next) => {
      req.url = '/build/';
      devMiddleware(req, res, next);
    });
    return;
  }

  // production: serve SEO-optimized routes where possible
  //
  // Retrieve the default bundle from /build/index.html, and overwrite <meta>
  // tags with data fetched from the backend.
  if (!templateFile) {
    throw new Error('Template not found, cannot start production server');
  }

  const renderWithMetaTags = (res, title, description, author) => {
    const $tmpl = cheerio.load(templateFile);
    $tmpl('meta[name="title"]').attr('content', title);
    $tmpl('meta[name="description"]').attr('content', description);
    $tmpl('meta[name="author"]').attr('content', author);
    $tmpl('meta[name="twitter:title"]').attr('content', title);
    $tmpl('meta[name="twitter:description"]').attr('content', description);
    // $tmpl('meta[name="twitter:image"]').attr('content', '');
    $tmpl('meta[property="og:title"]').attr('content', title);
    $tmpl('meta[property="og:description"]').attr('content', description);
    // $tmpl('meta[property="og:image"]').attr('content', '');
    res.send($tmpl.html());
  };

  // TODO: insert routes, e.g. app.get('/:scope', async (req, res, next) => ...), which call renderWithMetaTags here
  // serve the unmodified bundle on all other routes
  app.get('*', (req, res, next) => {
    sendFile(res);
  });

};

export default setupAppRoutes;
