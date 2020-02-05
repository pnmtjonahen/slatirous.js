describe('Slatirous Blogging', function() {
  it('Visits the index blog and open about', function() {
    cy.visit('http://localhost:8080')

    cy.get('#about').click()

    cy.url().should('include', '?blog=about')
  })

  it('Visits the book marked about page', function() {
    cy.visit('http://localhost:8080/?blog=about')

    cy.url().should('include', '?blog=about')
  })
})
