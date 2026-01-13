import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Amma } from './amma';

describe('Amma', () => {
  let component: Amma;
  let fixture: ComponentFixture<Amma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Amma]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Amma);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
