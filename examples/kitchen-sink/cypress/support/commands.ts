/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

Cypress.on(
  // @ts-ignore
  'uncaught:exception',
  (err) => !err.message.includes('ResizeObserver loop limit exceeded')
)

Cypress.Commands.add('getRTE', () => {
  return cy.get(
    `[role="textbox"][data-slate-editor="true"][contenteditable="true"]`
  )
})

const getIframeDocument = () => {
  return (
    cy
      .get('iframe')
      // Cypress yields jQuery element, which has the real
      // DOM element under property "0".
      // From the real DOM iframe element we can get
      // the "document" element, it is stored in "contentDocument" property
      // Cypress "its" command can access deep properties using dot notation
      // https://on.cypress.io/its
      .its('0.contentDocument')
      .should('exist')
  )
}

const getIframeBody = () => {
  // get the document
  return (
    getIframeDocument()
      // automatically retries until body is loaded
      .its('body')
      .should('not.be.undefined')
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      .then(cy.wrap)
  )
}

Cypress.Commands.add('focusRTE', () => {
  return cy.getRTE().children().first().click('bottomLeft')
})

Cypress.Commands.add('getPageRTEBody', () => {
  return getIframeBody().find(`[data-test="rich-text-body"]`)
})

Cypress.Commands.add('login', () => {
  // Fake Login
  localStorage.setItem('tina.isEditing', 'true')

  cy.reload()
})

Cypress.Commands.add('logout', () => {
  // Fake Logout
  localStorage.removeItem('tina.isEditing')

  cy.reload()
})

Cypress.Commands.add('getSaveButton', () => {
  return cy.get('.tina-tailwind .flex-1 > .text-white')
})

Cypress.Commands.add('save', () => {
  cy.getSaveButton().click()
})

Cypress.Commands.add(
  'assertRTE',
  (markdown = '', typed = '', wantedHTML = '', wantedMD = '') => {
    // This type of test is not support with the data layer so ignore for now
    if (markdown) return
    // if (markdown !== null) cy.task('writemdx', markdown)

    cy.focusRTE()

    if (typed) cy.getRTE().type(typed)

    cy.getPageRTEBody().should('contain.html', wantedHTML)

    if (!wantedMD) return

    cy.save()

    // TODO: See why this is needed on windows
    cy.wait(4000)

    cy.task('readrawmdx').then((content) => {
      expect(content).to.contain(wantedMD)
    })
  }
)
