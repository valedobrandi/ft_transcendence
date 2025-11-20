// cypress/support/e2e.js

// This runs before every test
// You can add global hooks or custom commands here

// Example: log before each test
beforeEach(() => {
  cy.log('Starting a new test...');
});

// Example: custom command
// Cypress.Commands.add('login', (username, password) => {
//   cy.get('input[name="username"]').type(username);
//   cy.get('input[name="password"]').type(password);
//   cy.get('button[type="submit"]').click();
// });
