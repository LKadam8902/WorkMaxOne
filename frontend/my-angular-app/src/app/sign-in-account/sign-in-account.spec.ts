import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInAccount } from './sign-in-account.component';

describe('SignInAccount', () => {
  let component: SignInAccount;
  let fixture: ComponentFixture<SignInAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
