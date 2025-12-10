import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PassCatcherOwnershipComponent } from './pass-catcher-ownership.component';

describe('PassCatcherOwnershipComponent', () => {
  let component: PassCatcherOwnershipComponent;
  let fixture: ComponentFixture<PassCatcherOwnershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassCatcherOwnershipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PassCatcherOwnershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
