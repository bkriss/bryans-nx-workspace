import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SavePlayerModalComponent } from './save-player-modal.component';

describe('SavePlayerModalComponent', () => {
  let component: SavePlayerModalComponent;
  let fixture: ComponentFixture<SavePlayerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavePlayerModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SavePlayerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
