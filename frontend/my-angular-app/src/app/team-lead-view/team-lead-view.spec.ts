import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLeadView } from './team-lead-view';

describe('TeamLeadView', () => {
  let component: TeamLeadView;
  let fixture: ComponentFixture<TeamLeadView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamLeadView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamLeadView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
