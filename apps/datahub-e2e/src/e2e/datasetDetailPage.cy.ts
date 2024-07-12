import 'cypress-real-events'
import path from 'path'

beforeEach(() => {
  // GEOSERVER stubs
  cy.intercept(
    'GET',
    '/geoserver/insee/ows?SERVICE=WMS&REQUEST=GetCapabilities',
    {
      fixture: 'insee-wms-getcapabilities.xml',
    }
  )
  cy.intercept(
    'GET',
    '/geoserver/insee/ows?SERVICE=WMS&REQUEST=GetCapabilities',
    {
      fixture: 'insee-wfs-getcapabilities.xml',
    }
  )
  cy.intercept(
    'GET',
    '/geoserver/insee/ows?REQUEST=GetMap&SERVICE=WMS&VERSION=1.3.0&FORMAT=image%2Fpng&STYLES=&TRANSPARENT=true&LAYERS=rectangles_200m_menage_erbm*',
    {
      fixture: 'insee-rectangles_200m_menage_erbm.png',
    }
  )
  cy.intercept(
    'GET',
    '/geoserver/insee/ows?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=insee%3Arectangles_200m_menage_erbm&OUTPUTFORMAT=application%2Fjson*',
    {
      fixture: 'insee-rectangles_200m_menage_erbm.json',
    }
  )
  cy.intercept(
    'GET',
    '/geoserver/insee/ows?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=insee%3Arectangles_200m_menage_erbm&OUTPUTFORMAT=csv',
    {
      fixture: 'insee-rectangles_200m_menage_erbm.csv',
    }
  )

  // OPENDATASOFT stub
  cy.intercept(
    'GET',
    '/explore/dataset/population-millesimee-communes-francaises/download?format=csv&timezone=Europe/Berlin&use_labels_for_header=false',
    {
      fixture: 'population-millesimee-communes-francaises.csv',
    }
  )

  // OGC API stubs
  cy.intercept(
    'GET',
    '/data/ogcapi/collections/liste-des-jardins-familiaux-et-partages-de-roubaix/items?f=json',
    {
      fixture: 'liste-des-jardins-familiaux-et-partages-de-roubaix_items.json',
    }
  )
  cy.intercept('GET', '/data/ogcapi/collections/covoit-mel/items?f=json', {
    fixture: 'covoit-mel_items.json',
  })
  cy.intercept(
    'GET',
    '/data/ogcapi/collections/liste-des-jardins-familiaux-et-partages-de-roubaix?f=json',
    {
      fixture: 'liste-des-jardins-familiaux-et-partages-de-roubaix.json',
    }
  )
  cy.intercept('GET', '/data/ogcapi/collections/covoit-mel?f=json', {
    fixture: 'covoit-mel.json',
  })
  cy.intercept('GET', '/data/ogcapi/collections?f=json', {
    fixture: 'ogcapi_collections.json',
  })
  cy.intercept('GET', '/data/ogcapi/conformance?f=json', {
    fixture: 'ogcapi_conformance.json',
  })
  cy.intercept('GET', '/data/ogcapi/?f=json', {
    fixture: 'ogcapi.json',
  })
})

describe('dataset pages', () => {
  beforeEach(() => {
    // dataset without API, preview or downloads
    // cy.visit('/dataset/011963da-afc0-494c-a2cc-5cbd59e122e4')
    // dataset with map error
    // cy.visit('/dataset/6d0bfdf4-4e94-48c6-9740-3f9facfd453c')
    // dataset with stuff greyed out & unknown data types
    // cy.visit('/dataset/8698bf0b-fceb-4f0f-989b-111e7c4af0a4')
    // dataset with pretty much everything
    cy.visit('/dataset/04bcec79-5b25-4b16-b635-73115f7456e4')
  })

  describe('GENERAL : display & functions', () => {
    describe('header', () => {
      it('should display the title, favorite star group and arrow back', () => {
        cy.get('datahub-header-record')
          .children('header')
          .find('.font-title')
          .should(($element) => {
            const text = $element.text().trim()
            expect(text).not.to.equal('')
          })
        cy.get('datahub-header-record')
          .children('header')
          .find('gn-ui-favorite-star')
        cy.get('datahub-header-record')
          .children('header')
          .find('gn-ui-navigation-button')
        cy.screenshot({ capture: 'fullPage' })
      })
      it('should display the data type, last update and status', () => {
        cy.visit('/dataset/01491630-78ce-49f3-b479-4b30dabc4c69')
        cy.get('datahub-header-record')
          .children('header')
          .find('.font-title')
          .next()
          .as('infoBar')
        cy.get('@infoBar').children('div').should('have.length', 3)
      })
      it('should return to the dataset list', () => {
        cy.get('datahub-header-record')
          .children('header')
          .find('gn-ui-navigation-button')
          .click()
        cy.url().should('include', '/search')
      })
    })
  })

  describe('ABOUT SECTION : display & functions', () => {
    describe('display', () => {
      it('should display the description', () => {
        cy.get('datahub-record-metadata')
          .find('[id="about"]')
          .find('gn-ui-markdown-parser')
          .should(($element) => {
            const text = $element.text().trim()
            expect(text).not.to.equal('')
          })
      })
      it('should display the read more button and expand description', () => {
        cy.visit('/dataset/01491630-78ce-49f3-b479-4b30dabc4c69')
        cy.get('datahub-record-metadata')
          .find('[id="about"]')
          .find('gn-ui-max-lines')
          .as('maxLines')
        cy.get('@maxLines').find('.ease-out').should('exist')
        cy.get('[data-cy=readMoreButton]').click()
        cy.get('@maxLines').find('.ease-in').should('exist')
      })
      it('should display the thumbnail image and magnify', () => {
        cy.get('datahub-record-metadata')
          .find('[id="about"]')
          .find('gn-ui-image-overlay-preview')
          .as('overlay')
          .should('have.length', 1)
        cy.get('@overlay').find('gn-ui-button').click()
        cy.get('[class="basicLightbox__placeholder"]')
          .as('lightbox')
          .find('img')
          .should('have.length', 1)
        cy.get('body').click()
        cy.get('@lightbox').should('have.length', 0)
      })
      it('should display the contact details', () => {
        cy.get('datahub-record-metadata')
          .find('[id="about"]')
          .find('gn-ui-metadata-contact')
          .should('have.length', 1)
        cy.get('[data-cy="contact-email"]')
          .invoke('text')
          .should('include', '@')
        cy.get('datahub-record-metadata')
          .find('[id="about"]')
          .find('gn-ui-metadata-catalog')
          .should('have.length', 1)
      })
      it('should display the catalog details', () => {
        cy.get('datahub-record-metadata')
          .find('[id="about"]')
          .find('gn-ui-metadata-catalog')
          .children('div')
          .children('p')
          .eq(1)
          .should(($element) => {
            const text = $element.text().trim()
            expect(text).not.to.equal('')
          })
      })
      it('should display the keywords', () => {
        cy.get('gn-ui-expandable-panel').eq(2).click()
        cy.get('gn-ui-badge').should('have.length.gt', 0)
      })
      it('should display three expandable panels', () => {
        cy.get('datahub-record-metadata')
          .find('gn-ui-expandable-panel')
          .should('have.length', 3)
      })
      describe('about section', () => {
        it('should display the lineage', () => {
          cy.get('datahub-record-metadata')
            .find('[id="about"]')
            .find('gn-ui-markdown-parser')
            .should(($element) => {
              const text = $element.text().trim()
              expect(text).not.to.equal('')
            })
        })
        it('should display the data producer elements', () => {
          cy.get('datahub-record-metadata')
            .find('[id="about"]')
            .find('gn-ui-thumbnail')
            .should('be.visible')
          cy.get('datahub-record-metadata')
            .find('[data-cy="organization-name"]')
            .parent()
            .children('div')
            .should('have.length', 4)
        })
        it('should display the creation date, the publication date, the frequency, the languages and the temporal extent', () => {
          cy.get('datahub-record-metadata')
            .find('[id="about"]')
            .find('gn-ui-expandable-panel')
            .eq(1)
            .click()
          cy.get('gn-ui-expandable-panel')
            .eq(1)
            .children('div')
            .eq(1)
            .children('div')
            .eq(2)
            .children('div')
            .should('have.length', 5)
        })
      })
    })
    describe('features', () => {
      let keyword
      it('should go to provider website on click', () => {
        cy.get('datahub-record-metadata')
          .find('[id="about"]')
          .find('gn-ui-metadata-contact')
          .children('div')
          .children('div')
          .find('a')
          .first()
          .as('proviLink')

        cy.get('@proviLink')
          .invoke('attr', 'href')
          .then((link) => {
            expect(link).to.eq('https://www.geo2france.fr/')
          })
      })
      it('should go to dataset search page when clicking on org name and filter by org', () => {
        cy.get('[data-cy="organization-name"]').eq(1).click()
        cy.url().should('include', '/search?organization=')
      })
      it('should go to dataset search page when clicking on keyword and filter by keyword', () => {
        cy.get('gn-ui-expandable-panel').eq(2).click()

        cy.get('gn-ui-badge').should('have.length.gt', 0).eq(1).as('keyword')

        cy.get('@keyword').then((key) => {
          keyword = key.text().toUpperCase()
          cy.get('@keyword').first().click()
          cy.url().should('include', '/search?q=')
          cy.get('gn-ui-fuzzy-search')
            .find('input')
            .should('have.value', keyword)
        })
      })
      it('should open the lightbox', () => {
        cy.get('datahub-record-metadata')
          .find('[id="about"]')
          .find('gn-ui-thumbnail')
          .eq(1)
          .next()
          .find('gn-ui-button')
          .click()
        cy.get('.basicLightbox--visible')
        cy.screenshot({ capture: 'viewport' })
      })
    })

    describe('metadata quality widget enabled', () => {
      beforeEach(() => {
        // this will enable metadata quality widget
        cy.intercept('GET', '/assets/configuration/default.toml', {
          fixture: 'config-with-metadata-quality.toml',
        })
        cy.reload()
      })

      it('should display quality widget', () => {
        cy.get('gn-ui-metadata-quality gn-ui-progress-bar')
          .eq(0)
          .should('have.attr', 'ng-reflect-value', 87)
        cy.screenshot({ capture: 'fullPage' })
      })
    })
  })

  describe('PREVIEW SECTION : display & functions', () => {
    beforeEach(() => {
      cy.get('datahub-record-metadata')
        .find('[id="preview"]')
        .first()
        .as('previewSection')
    })
    describe('display', () => {
      it('should display the tabs', () => {
        cy.get('@previewSection')
          .find('.mat-mdc-tab-labels')
          .children('div')
          .should('have.length', 3)
      })
      it('should display the dataset dropdown with at least 1 option', () => {
        cy.get('@previewSection')
          .find('gn-ui-dropdown-selector')
          .openDropdown()
          .children('button')
          .should('have.length.gt', 1)
      })
      it('should display the map', () => {
        cy.get('@previewSection').find('gn-ui-map').should('be.visible')
      })
      it('should display the table', () => {
        cy.get('@previewSection')
          .find('.mat-mdc-tab-labels')
          .children('div')
          .eq(1)
          .click()
        cy.get('@previewSection').find('gn-ui-table').should('be.visible')
        cy.get('@previewSection')
          .find('gn-ui-table')
          .find('table')
          .find('tbody')
          .children('tr')
          .should('have.length.gt', 0)
        cy.screenshot({ capture: 'fullPage' })
      })
      it('should display the chart & dropdowns', () => {
        cy.get('@previewSection')
          .find('.mat-mdc-tab-labels')
          .children('div')
          .eq(2)
          .click()
        cy.get('@previewSection')
          .find('gn-ui-chart')
          .should('not.match', ':empty')
        cy.get('@previewSection')
          .find('gn-ui-chart-view')
          .find('gn-ui-dropdown-selector')
          .filter(':visible')
          .as('drop')
        cy.get('@drop').should('have.length', 4)
        cy.get('@drop').each((dropdown) => {
          cy.wrap(dropdown)
            .openDropdown()
            .find('button')
            .should('have.length.greaterThan', 0)
        })
        cy.screenshot({ capture: 'fullPage' })
      })
    })
    describe('features', () => {
      it('MAP : should open a popup on layer click', () => {
        cy.get('@previewSection').find('canvas').realClick()
        cy.request({
          method: 'GET',
          url: ' https://www.geo2france.fr/geoserver/insee/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=rectangles_200m_menage_erbm&LAYERS=rectangles_200m_menage_erbm&INFO_FORMAT=application%2Fjson&I=249&J=65&WIDTH=296&HEIGHT=296&CRS=EPSG%3A3857&STYLES=&BBOX=-24459.849051256402%2C6237261.508070382%2C337545.9169073383%2C6599267.274028977',
          failOnStatusCode: false,
        })
        cy.get('@previewSection').find('gn-ui-feature-detail')
      })
      it('TABLE : should scroll', () => {
        cy.get('@previewSection')
          .find('.mat-mdc-tab-labels')
          .children('div')
          .eq(1)
          .click()
        cy.get('@previewSection').find('gn-ui-table').find('table').as('table')
        cy.get('@table').scrollTo('bottom', { ensureScrollable: false })

        cy.get('@table').find('tr:last-child').should('be.visible')
      })
      it('CHART : should change the chart on options change', () => {
        cy.get('@previewSection')
          .find('.mat-mdc-tab-labels')
          .children('div')
          .eq(2)
          .click()
        cy.get('@previewSection')
          .find('gn-ui-chart-view')
          .find('gn-ui-dropdown-selector')
          .filter(':visible')
          .as('drop')
        cy.get('@drop').eq(0).selectDropdownOption('pie')
        cy.get('@drop').eq(2).selectDropdownOption('men')
        cy.get('@drop').eq(3).selectDropdownOption('average')
        cy.get('@previewSection')
          .find('gn-ui-chart')
          .invoke('attr', 'ng-reflect-type')
          .should('include', 'pie')
        cy.get('@previewSection')
          .find('gn-ui-chart')
          .invoke('attr', 'ng-reflect-value-property')
          .should('include', 'average(men)')
      })
    })
  })

  describe('DOWNLOADS : display & functions', () => {
    describe('display', () => {
      it('should have a list of downloads based on the WFS capabilities', () => {
        cy.get('datahub-record-downloads')
          .find('gn-ui-download-item [data-cy="download-format"]')
          .then((formatBadges) => {
            const formats = formatBadges
              .toArray()
              .map((badge) => badge.innerText.trim())
            expect(formats).to.eql([
              'csv',
              'excel',
              'json',
              'shp',
              'gml',
              'kml',
              'gpkg',
              'zip',
              'dxf',
            ])
          })
      })
      it('should have filter buttons for each download types + all and others', () => {
        cy.get('[data-cy="download-format-filters"]')
          .find('gn-ui-button')
          .then((buttons) => {
            expect(buttons).to.have.length(6)
            const formats = buttons
              .toArray()
              .map((button) => button.getAttribute('data-format'))
            expect(formats).to.eql([
              'all',
              'csv',
              'excel',
              'json',
              'shp',
              'others',
            ])
          })
      })
      describe('features', () => {
        it('filters the download list on format filter click', () => {
          cy.get('datahub-record-downloads')
            .find('gn-ui-button')
            .children('button')
            .eq(1)
            .as('filterFormat')
          cy.get('@filterFormat').click()
          cy.get('@filterFormat').then((btn) => {
            const filterFormat = btn.text().trim()
            cy.get('[data-cy="download-format"]')
              .filter(':visible')
              .then((format) => {
                const formatOutput = format.text().trim()
                expect(formatOutput).to.eq(filterFormat)
              })
          })
          cy.screenshot({ capture: 'fullPage' })
        })
        it('downloads a file on click', () => {
          cy.get('datahub-record-downloads')
            .find('gn-ui-download-item')
            .first()
            .click()
          cy.readFile(path.join('cypress/downloads', 'ows.csv')).as(
            'downloadedFile'
          )
          cy.get('@downloadedFile').should('exist')
          cy.get('@downloadedFile').its('length').should('equal', 3579)
        })
        it('displays the full list after clicking two times on one filter', () => {
          cy.get('datahub-record-downloads')
            .find('gn-ui-button')
            .children('button')
            .eq(1)
            .as('filterFormat')
          cy.get('@filterFormat').click()
          cy.get('[data-cy="download-format"]')
            .filter(':visible')
            .its('length')
            .then((l1) => {
              cy.get('@filterFormat').click()
              cy.get('[data-cy="download-format"]')
                .filter(':visible')
                .its('length')
                .then((l2) => expect(l2).to.not.equal(l1))
            })
        })
      })
    })
  })

  describe('LINKS : display & functions', () => {
    describe('display', () => {
      it('should have external, API and internal links with one option', () => {
        cy.get('datahub-record-otherlinks')
          .find('gn-ui-link-card')
          .should('have.length.gt', 0)
        cy.get('datahub-record-apis')
          .find('gn-ui-api-card')
          .should('have.length.gt', 0)
      })
      it('should not display carousel dot button for 4 link cards', () => {
        cy.get('datahub-record-otherlinks')
          .find('.carousel-step-dot')
          .should('exist')
      })
      it('should not display carousel dot button for 2 API cards', () => {
        cy.get('datahub-record-apis')
          .find('.carousel-step-dot')
          .should('not.exist')
      })
    })
    describe('features', () => {
      it('goes to external link on click', () => {
        cy.get('datahub-record-otherlinks')
          .find('gn-ui-link-card')
          .first()
          .children('a')
          .as('proviLink')

        cy.get('@proviLink')
          .invoke('attr', 'href')
          .then((link) => {
            expect(link).to.eq(
              'https://www.data.gouv.fr/fr/datasets/donnees-carroyees-a-200-m-sur-la-population/'
            )
          })
      })
      it('copies the API path on click', () => {
        cy.get('datahub-record-apis')
          .find('gn-ui-copy-text-button')
          .find('button')
          .first()
          .realClick()
        // attempt to make the whole page focused
        cy.get('body').focus()
        cy.get('body').realClick()
        cy.window().then((win) => {
          win.navigator.clipboard.readText().then((text) => {
            expect(text).to.eq('https://www.geo2france.fr/geoserver/insee/ows')
          })
        })
      })
      describe('related records', () => {
        beforeEach(() => {
          cy.visit('/dataset/6d0bfdf4-4e94-48c6-9740-3f9facfd453c')
        })
        it('should display the related records', () => {
          cy.get('#related-records')
            .find('datahub-record-related-records')
            .find('gn-ui-related-record-card')
            .should('have.length.gt', 0)
        })
        it('goes to dataset on click', () => {
          let targetLink
          cy.get('#related-records')
            .find('datahub-record-related-records')
            .find('gn-ui-related-record-card')
            .first()
            .children('a')
            .as('proviLink')

          cy.get('@proviLink')
            .invoke('attr', 'href')
            .then((link) => {
              targetLink = link
              cy.get('@proviLink').invoke('removeAttr', 'target').click()
              cy.url().should('include', targetLink)
            })
        })
      })

      describe('When there is no link', () => {
        beforeEach(() => {
          cy.visit('/dataset/a3774ef6-809d-4dd1-984f-9254f49cbd0a')
        })
        it('display the error datasetHasNoLink error block', () => {
          cy.get('[data-test="dataset-has-no-link-block"]').should('exist')
        })
      })
    })
  })
})

describe('record with file distributions', () => {
  beforeEach(() => {
    cy.visit('/dataset/n_tri_lill_inondable_s_059')
    cy.get('datahub-record-metadata')
      .find('[id="preview"]')
      .first()
      .as('previewSection')
    cy.get('@previewSection')
      .find('.mat-mdc-tab-labels')
      .children('div')
      .eq(1)
      .click()
  })

  it('should display the distributions by priority', () => {
    cy.get('@previewSection')
      .find('gn-ui-dropdown-selector')
      .last()
      .openDropdown()
      .children('button')
      .then((options) => options.toArray().map((el) => el.innerText.trim()))
      .should('deep.eq', ['csv (csv)', 'json (json)', 'geojson (geojson)'])
    cy.screenshot({ capture: 'viewport' })
  })
})

describe('api cards', () => {
  beforeEach(() => {
    cy.visit('/dataset/04bcec79-5b25-4b16-b635-73115f7456e4')
    cy.get('gn-ui-api-card').eq(1).as('firstCard')
  })

  it('should display the open panel button', () => {
    cy.get('@firstCard')
      .find('button')
      .children('mat-icon')
      .eq(1)
      .should('have.text', 'more_horiz')
  })
  it('should open and close the panel on click on open panel button', () => {
    cy.get('@firstCard').find('button').eq(1).click()
    cy.get('gn-ui-record-api-form').should('be.visible')
    cy.screenshot({ capture: 'fullPage' })
    cy.get('@firstCard').find('button').eq(1).click()
    cy.get('gn-ui-record-api-form').should('not.be.visible')
  })
})

describe('api form', () => {
  describe('When the api link is ok', () => {
    beforeEach(() => {
      cy.visit('/dataset/accroche_velos')
      cy.get('gn-ui-api-card').first().find('button').eq(1).click()
      cy.get('gn-ui-record-api-form').children('div').as('apiForm')
    })
    it('should have request inputs', () => {
      cy.get('@apiForm').find('gn-ui-text-input').should('have.length', 2)
      cy.get('@apiForm')
        .find('gn-ui-dropdown-selector')
        .should('have.length', 1)
      cy.get('@apiForm')
        .children('div')
        .first()
        .children('div')
        .first()
        .find('button')
        .should('have.length', 1)
      cy.get('@apiForm').find('gn-ui-copy-text-button').should('have.length', 1)
    })
    it('should change url on input change', () => {
      cy.get('@apiForm')
        .find('gn-ui-copy-text-button')
        .find('input')
        .invoke('val')
        .then((url) => {
          cy.get('@apiForm').find('gn-ui-text-input').first().clear()
          cy.get('@apiForm').find('gn-ui-text-input').first().type('54')
          cy.get('@apiForm')
            .find('gn-ui-copy-text-button')
            .find('input')
            .invoke('val')
            .should('not.eq', url)
            .and('include', '54')
        })
    })
    it('should set limit to zero on click on "All" button', () => {
      cy.get('@apiForm').find('gn-ui-text-input').first().clear()
      cy.get('@apiForm').find('gn-ui-text-input').first().type('54')
      cy.get('@apiForm').find('input[type="checkbox"]').check()
      cy.get('@apiForm')
        .find('gn-ui-text-input')
        .first()
        .should('have.value', '')
    })
    it('should reset all 3 inputs and link on click', () => {
      cy.get('@apiForm').find('gn-ui-text-input').first().as('firstInput')
      cy.get('@firstInput').clear()
      cy.get('@firstInput').type('54')

      cy.get('@apiForm').find('gn-ui-text-input').eq(1).as('secondInput')
      cy.get('@secondInput').clear()
      cy.get('@secondInput').type('87')

      cy.get('@apiForm').find('gn-ui-dropdown-selector').as('dropdown')
      cy.get('@dropdown').eq(0).selectDropdownOption('geojson')

      cy.get('@apiForm')
        .find('gn-ui-copy-text-button')
        .find('input')
        .invoke('val')
        .should('include', 'f=geojson&limit=54&offset=87')

      cy.get('@apiForm').children('div').first().find('button').first().click()

      cy.get('@firstInput').find('input').should('have.value', '')
      cy.get('@secondInput').find('input').should('have.value', '')
      cy.get('@apiForm')
        .find('gn-ui-dropdown-selector')
        .find('button')
        .children('div')
        .should('have.text', ' JSON ')
      cy.get('@apiForm')
        .find('gn-ui-copy-text-button')
        .find('input')
        .invoke('val')
        .should('include', 'f=json&limit=-1')
    })
    it('should close the panel on click', () => {
      cy.get('gn-ui-record-api-form').prev().find('button').click()
      cy.get('gn-ui-record-api-form').should('not.be.visible')
    })
    it('should switch to other card url if card already open', () => {
      cy.get('@apiForm')
        .find('gn-ui-copy-text-button')
        .find('input')
        .invoke('val')
        .then((url) => {
          cy.get('@apiForm').find('gn-ui-text-input').first().clear()
          cy.get('@apiForm').find('gn-ui-text-input').first().type('54')
          cy.get('gn-ui-api-card').eq(1).find('button').eq(1).click()
          cy.get('@apiForm')
            .find('gn-ui-copy-text-button')
            .find('input')
            .invoke('val')
            .should('not.eq', url)
        })
    })
  })
})

describe('userFeedback', () => {
  describe('when not logged in', () => {
    beforeEach(() => {
      cy.visit('/dataset/accroche_velos')
      cy.get('datahub-record-user-feedbacks').as('userFeedback')
    })
    it('should sort comments', () => {
      cy.get('gn-ui-user-feedback-item')
        .find('[data-cy="commentText"]')
        .as('commentText')

      cy.get('@commentText')
        .first()
        .then((div) => {
          const firstCommentBeforeSort = div.text().trim()
          cy.get('@userFeedback')
            .find('gn-ui-dropdown-selector')
            .openDropdown()
            .children('button')
            .eq(1)
            .click()

          cy.get('gn-ui-user-feedback-item')
            .find('[data-cy="commentText"]')
            .first()
            .invoke('text')
            .invoke('trim')
            .should('not.eq', firstCommentBeforeSort)
        })
    })
    it("shouldn't be able to comment", () => {
      cy.get('datahub-record-user-feedbacks')
        .find('gn-ui-text-area')
        .should('not.exist')
    })
  })

  describe('when logged in', () => {
    beforeEach(() => {
      cy.login()
      cy.visit('/dataset/accroche_velos')
    })
    it('should publish a comment', () => {
      cy.get('datahub-record-user-feedbacks')
        .find('gn-ui-text-area')
        .first()
        .should('exist')
        .type('Something')

      cy.get('datahub-record-user-feedbacks')
        .find('gn-ui-button')
        .eq(1)
        .should('exist')
    })
    it('should answer to a comment', () => {
      cy.get('gn-ui-user-feedback-item')
        .find('gn-ui-text-area')
        .first()
        .should('exist')
        .type('Something')

      cy.get('gn-ui-user-feedback-item')
        .find('gn-ui-button')
        .eq(0)
        .should('exist')
    })
  })
})

describe('When the metadata does not exists', () => {
  beforeEach(() => {
    cy.visit('/dataset/xyz')
  })
  it('should display an error message', () => {
    cy.get('gn-ui-error').should('exist')
    cy.screenshot({ capture: 'viewport' })
  })
})
