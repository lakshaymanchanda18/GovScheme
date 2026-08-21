const serverModule = require('../server/dist/index');
const app = serverModule.default || serverModule;

module.exports = app;
