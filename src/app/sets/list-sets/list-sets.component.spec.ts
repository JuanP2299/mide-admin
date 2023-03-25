import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSetsComponent } from './list-sets.component';

describe('ListSetsComponent', () => {
  let component: ListSetsComponent;
  let fixture: ComponentFixture<ListSetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListSetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
