import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortPlayerPoolComponent } from './sort-player-pool.component';

describe('SortPlayerPoolComponent', () => {
  let component: SortPlayerPoolComponent;
  let fixture: ComponentFixture<SortPlayerPoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortPlayerPoolComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SortPlayerPoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
