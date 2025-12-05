describe("homepage", () => {
  it("renders the seeded homepage hero heading", () => {
    cy.visit("/");
    cy.contains("Welcome to your CMS boilerplate").should("exist");
  });
});
