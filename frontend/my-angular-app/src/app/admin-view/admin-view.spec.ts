import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewComponent } from './admin-view';

describe('AdminViewComponent', () => {
  let component: AdminViewComponent;
  let fixture: ComponentFixture<AdminViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Section 1" heading', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('Section 1');
  });

  it('should render the user table', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('table')).toBeTruthy();
    expect(compiled.querySelectorAll('th').length).toBe(5); // userId, username, user email Id, user role, Permit
  });

  it('should display user data correctly', () => {
    const compiled = fixture.nativeElement;
    const firstRow = compiled.querySelector('tbody tr');
    expect(firstRow.children[0].textContent).toBe('r323qf');
    expect(firstRow.children[1].textContent).toBe('demo');
    expect(firstRow.children[2].textContent).toBe('demo123@gmail.com');
    expect(firstRow.children[3].textContent).toBe('Team Lead');
    expect(firstRow.children[4].querySelector('input[type="checkbox"]').checked).toBe(true);
  });
});