import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurshasesComponent } from './purshases.component';

describe('PurshasesComponent', () => {
  let component: PurshasesComponent;
  let fixture: ComponentFixture<PurshasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurshasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurshasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
