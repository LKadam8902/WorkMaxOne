import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInAccountComponent } from './sign-in-account.component';

describe('SignInAccountComponent', () => {
  let component: SignInAccountComponent;
  let fixture: ComponentFixture<SignInAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
