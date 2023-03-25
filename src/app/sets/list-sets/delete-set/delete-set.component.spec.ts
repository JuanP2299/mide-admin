import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSetComponent } from './delete-set.component';

describe('DeleteSetComponent', () => {
  let component: DeleteSetComponent;
  let fixture: ComponentFixture<DeleteSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
function expect(component: DeleteSetComponent) {
 return expect(component).toBeTruthy();
}

