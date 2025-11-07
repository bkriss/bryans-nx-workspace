import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectSlateComponent } from './select-slate.component';

describe('SelectSlateComponent', () => {
  let component: SelectSlateComponent;
  let fixture: ComponentFixture<SelectSlateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectSlateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectSlateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
