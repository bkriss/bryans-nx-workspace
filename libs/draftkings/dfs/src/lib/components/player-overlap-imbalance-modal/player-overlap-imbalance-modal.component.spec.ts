import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerOverlapImbalanceModalComponent } from './player-overlap-imbalance-modal.component';

describe('PlayerOverlapImbalanceModalComponent', () => {
  let component: PlayerOverlapImbalanceModalComponent;
  let fixture: ComponentFixture<PlayerOverlapImbalanceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerOverlapImbalanceModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerOverlapImbalanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
