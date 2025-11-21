// e2e/example.cy.js

describe('My First Test', () => {
  it('visits the app and checks the title', () => {
    // Visit your app (baseUrl is automatically prepended)
    cy.visit('/');

    // Assert that the page contains expected text
    cy.contains('Ft_transcendence Ping-Pong').should('be.visible');

  });
});
