describe('Slatirous Blogging', function() {
  it('Visits the index blog and open about', function() {
    cy.visit('http://blog.tjonahen.nl')

    cy.get('#about').click()

    cy.url().should('include', '?blog=about')
  })

  it('Visits the book marked about page', function() {
    cy.visit('http://blog.tjonahen.nl/?blog=about')

    cy.url().should('include', '?blog=about')
  })
})
