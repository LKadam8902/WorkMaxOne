import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenchedEmployeeView } from './benched-employee-view';

describe('BenchedEmployeeView', () => {
  let component: BenchedEmployeeView;
  let fixture: ComponentFixture<BenchedEmployeeView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchedEmployeeView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BenchedEmployeeView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
