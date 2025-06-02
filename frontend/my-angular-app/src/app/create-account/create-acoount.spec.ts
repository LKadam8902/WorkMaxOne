import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAcoount } from './create-acoount';

describe('CreateAcoount', () => {
  let component: CreateAcoount;
  let fixture: ComponentFixture<CreateAcoount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAcoount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAcoount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
