import { async, TestBed } from '@angular/core/testing';

import { Observable, of } from 'rxjs';

import { AppComponent } from './app.component';
import { TestClientService } from './services/test-client.service';

class TestClientServiceMock {
  find = (id: number): Observable<any> => of({ id });
  create = (user: any): Observable<any> => of(user);
  update = (id: number): Observable<any> => of({ id });
  querySample = (): Observable<any> => of({ id: 1 });
  toggleFlag = (id: 1): Observable<any> => of({ id });
  list = (): Observable<any[]> => of([ { id: 1 }, { id: 2 } ]);
}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          AppComponent
        ],
        providers: [
          { provide: TestClientService, useClass: TestClientServiceMock }
        ]
      })
      .compileComponents()
      .then();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
