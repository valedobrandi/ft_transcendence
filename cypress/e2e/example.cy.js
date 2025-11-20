// e2e/example.cy.js

describe('My First Test', () => {
  it('visits the app and checks the title', () => {
    // Visit your app (baseUrl is automatically prepended)
    cy.visit('/');

    // Assert that the page contains expected text
    cy.contains('Welcome').should('be.visible');

    // Example: check the document title
    cy.title().should('include', 'My App');
  });
});
