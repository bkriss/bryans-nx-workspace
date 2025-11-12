import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerDistributionsComponent } from './player-distributions.component';

describe('PlayerDistributionsComponent', () => {
  let component: PlayerDistributionsComponent;
  let fixture: ComponentFixture<PlayerDistributionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerDistributionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerDistributionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
