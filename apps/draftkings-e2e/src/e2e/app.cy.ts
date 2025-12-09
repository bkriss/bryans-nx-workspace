// import { getGreeting } from '../support/app.po';

describe('draftkings-e2e', () => {
  beforeEach(() => cy.visit('/dfs/slate-setup'));

  it('should display welcome message', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    // getGreeting().contains(/Welcome/);
    cy.get('h1').contains('Slate Setup');
  });
});
