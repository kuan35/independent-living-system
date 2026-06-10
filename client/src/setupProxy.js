module.exports = function(app) {
  app.use((req, res, next) => {
    res.setHeader("ngrok-skip-browser-warning", "true");
    next();
  });
};