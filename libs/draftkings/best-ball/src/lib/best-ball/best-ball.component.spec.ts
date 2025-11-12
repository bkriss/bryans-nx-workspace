import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BestBallComponent } from './best-ball.component';

describe('BestBallComponent', () => {
  let component: BestBallComponent;
  let fixture: ComponentFixture<BestBallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestBallComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BestBallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
