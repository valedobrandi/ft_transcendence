// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:3000',
    specPattern: 'e2e/**/*.cy.js',
  },
};
