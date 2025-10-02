import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LineupBuilderComponent } from './lineup-builder.component';

describe('LineupBuilderComponent', () => {
  let component: LineupBuilderComponent;
  let fixture: ComponentFixture<LineupBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineupBuilderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LineupBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
