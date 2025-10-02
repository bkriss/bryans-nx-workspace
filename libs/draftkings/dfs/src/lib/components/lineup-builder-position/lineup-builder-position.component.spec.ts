import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LineupBuilderPositionComponent } from './lineup-builder-position.component';

describe('LineupBuilderPositionComponent', () => {
  let component: LineupBuilderPositionComponent;
  let fixture: ComponentFixture<LineupBuilderPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineupBuilderPositionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LineupBuilderPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
