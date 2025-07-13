import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DfsComponent } from './dfs.component';

describe('DfsComponent', () => {
  let component: DfsComponent;
  let fixture: ComponentFixture<DfsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DfsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DfsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
