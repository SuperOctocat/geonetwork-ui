import { ComponentFixture, TestBed } from '@angular/core/testing'

import {
  DataViewPermalinkComponent,
  WEB_COMPONENT_EMBEDDER_URL,
} from './data-view-permalink.component'
import { BehaviorSubject, firstValueFrom, lastValueFrom, takeLast } from 'rxjs'
import { MdViewFacade } from '../state'
import { Component, Input } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { GN_UI_VERSION } from '../gn-ui-version.token'
import { provideRepositoryUrl } from '@geonetwork-ui/api/repository'

const chartConfig1 = {
  aggregation: 'sum',
  xProperty: 'anneeappro',
  yProperty: 'nbre_com',
  chartType: 'bar',
}

const chartConfig2 = {
  aggregation: 'min',
  xProperty: 'pro',
  yProperty: 'number',
  chartType: 'line',
}

const metadata = {
  uniqueIdentifier: 'md_record_1234',
}

class MdViewFacadeMock {
  chartConfig$ = new BehaviorSubject(chartConfig1)
  metadata$ = new BehaviorSubject(metadata)
}

const baseUrl = 'https://example.com/wc-embedder'

const gnUiVersion = 'v1.2.3'

@Component({
  selector: 'gn-ui-copy-text-button',
  template: '<div></div>',
})
export class MockCopyTextButtonComponent {
  @Input() text: string
  @Input() tooltipText: string
  @Input() rows: number
}
describe('DataViewPermalinkComponent', () => {
  let component: DataViewPermalinkComponent
  let fixture: ComponentFixture<DataViewPermalinkComponent>
  let facade

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataViewPermalinkComponent, MockCopyTextButtonComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRepositoryUrl('http://gn-api.url/'),
        {
          provide: MdViewFacade,
          useClass: MdViewFacadeMock,
        },
        {
          provide: WEB_COMPONENT_EMBEDDER_URL,
          useValue: baseUrl,
        },
        {
          provide: GN_UI_VERSION,
          useValue: gnUiVersion,
        },
      ],
    }).compileComponents()
    facade = TestBed.inject(MdViewFacade)
    fixture = TestBed.createComponent(DataViewPermalinkComponent)
    component = fixture.componentInstance
    component.viewType$.next('chart')
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('Chart view', () => {
    describe('init permalinkUrl$', () => {
      it('should generate URL based on configs', async () => {
        const url = await firstValueFrom(component.permalinkUrl$)
        expect(url).toBe(
          `https://example.com/wc-embedder?v=${gnUiVersion}&e=gn-dataset-view-chart&a=aggregation%3D${
            chartConfig1.aggregation
          }&a=x-property%3D${chartConfig1.xProperty}&a=y-property%3D${
            chartConfig1.yProperty
          }&a=chart-type%3D${
            chartConfig1.chartType
          }&a=api-url%3D${encodeURIComponent(
            component.config.basePath
          )}&a=dataset-id%3D${
            metadata.uniqueIdentifier
          }&a=primary-color%3D%230f4395&a=secondary-color%3D%238bc832&a=main-color%3D%23555&a=background-color%3D%23fdfbff`
        )
      })
    })
    describe('update permalinkUrl$', () => {
      beforeEach(() => {
        facade.chartConfig$.next(chartConfig2)
      })
      it('should update URL based on configs', async () => {
        const url = await firstValueFrom(component.permalinkUrl$)
        expect(url).toBe(
          `https://example.com/wc-embedder?v=${gnUiVersion}&e=gn-dataset-view-chart&a=aggregation%3D${
            chartConfig2.aggregation
          }&a=x-property%3D${chartConfig2.xProperty}&a=y-property%3D${
            chartConfig2.yProperty
          }&a=chart-type%3D${
            chartConfig2.chartType
          }&a=api-url%3D${encodeURIComponent(
            component.config.basePath
          )}&a=dataset-id%3D${
            metadata.uniqueIdentifier
          }&a=primary-color%3D%230f4395&a=secondary-color%3D%238bc832&a=main-color%3D%23555&a=background-color%3D%23fdfbff`
        )
      })
    })
  })
  describe('Map view', () => {
    beforeEach(() => {
      component.viewType$.next('map')
    })
    describe('init permalinkUrl$', () => {
      it('should generate URL based on configs', async () => {
        const url = await firstValueFrom(component.permalinkUrl$)
        expect(url).toBe(
          `https://example.com/wc-embedder?v=${gnUiVersion}&e=gn-dataset-view-map&a=api-url%3D${encodeURIComponent(
            component.config.basePath
          )}&a=dataset-id%3D${
            metadata.uniqueIdentifier
          }&a=primary-color%3D%230f4395&a=secondary-color%3D%238bc832&a=main-color%3D%23555&a=background-color%3D%23fdfbff`
        )
      })
    })
  })
  describe('Table view', () => {
    beforeEach(() => {
      component.viewType$.next('table')
    })
    describe('init permalinkUrl$', () => {
      it('should generate URL based on configs', async () => {
        const url = await firstValueFrom(component.permalinkUrl$)
        expect(url).toBe(
          `https://example.com/wc-embedder?v=${gnUiVersion}&e=gn-dataset-view-table&a=api-url%3D${encodeURIComponent(
            component.config.basePath
          )}&a=dataset-id%3D${
            metadata.uniqueIdentifier
          }&a=primary-color%3D%230f4395&a=secondary-color%3D%238bc832&a=main-color%3D%23555&a=background-color%3D%23fdfbff`
        )
      })
    })
  })
})
