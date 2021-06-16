import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import {
  AnalysisStatusEnumApiModel,
  FileUploadApiService,
  UploadJobStatusApiModel,
} from '@geonetwork-ui/data-access/datafeeder'
import { of } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { DatafeederFacade } from '../../../store/datafeeder.facade'
import { AnalysisProgressPageComponent } from './analysis-progress.page'

const jobMock: UploadJobStatusApiModel = {
  jobId: '1234',
  status: AnalysisStatusEnumApiModel.Done,
  progress: 1,
  datasets: [{}],
}
const jobMockNoDS: UploadJobStatusApiModel = {
  jobId: '1234',
  status: AnalysisStatusEnumApiModel.Done,
  progress: 1,
}

const facadeMock = {
  setUpload: jest.fn(),
}

const fileUploadApiServiceMock = {
  findUploadJob: jest.fn(() => of(jobMock)),
}

const activatedRouteMock = {
  params: of({ id: 1 }),
}

const routerMock = {
  navigate: jest.fn(),
}

describe('AnalysisProgress.PageComponent', () => {
  let component: AnalysisProgressPageComponent
  let fixture: ComponentFixture<AnalysisProgressPageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalysisProgressPageComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: FileUploadApiService,
          useValue: fileUploadApiServiceMock,
        },
        {
          provide: DatafeederFacade,
          useValue: facadeMock,
        },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisProgressPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('fetches batch status', () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected)
    })
    scheduler.run(({ expectObservable }) => {
      const expected = '500ms (a-|)'
      const values = {
        a: jobMock,
      }
      expectObservable(component.statusFetch$).toBe(expected, values)
    })
    expect(fileUploadApiServiceMock.findUploadJob).toHaveBeenCalledWith(1)
    expect(facadeMock.setUpload).toHaveBeenCalledWith(jobMock)
    expect(component.progress).toBe(1)
  })

  describe('Analysis DONE', () => {
    describe('with dataset', () => {
      let job
      beforeEach(() => {
        job = jobMock
        component.onJobFinish(job)
      })

      it('route to validation page', () => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['validation'], {
          relativeTo: activatedRouteMock,
          queryParams: {},
        })
      })
    })
    describe('with no dataset', () => {
      let job
      beforeEach(() => {
        job = jobMockNoDS
        component.onJobFinish(job)
      })

      it('route to home page with error', () => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['/'], {
          relativeTo: activatedRouteMock,
          queryParams: { error: 'analysis' },
        })
      })
    })
  })

  describe('Analysis ERROR', () => {
    let job
    beforeEach(() => {
      job = { ...jobMock, status: AnalysisStatusEnumApiModel.Error }
      component.onJobFinish(job)
    })

    it('route to home page with error', () => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/'], {
        relativeTo: activatedRouteMock,
        queryParams: { error: 'analysis' },
      })
    })
  })
})
