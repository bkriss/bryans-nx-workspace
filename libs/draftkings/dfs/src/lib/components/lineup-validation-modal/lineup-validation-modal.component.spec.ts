import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LineupValidationModalComponent } from './lineup-validation-modal.component';

describe('LineupValidationModalComponent', () => {
  let component: LineupValidationModalComponent;
  let fixture: ComponentFixture<LineupValidationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineupValidationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LineupValidationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
