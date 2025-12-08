import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
} from '@angular/fire/firestore';

import { EntriesComponent } from './entries.component';
import { of } from 'rxjs';
import { Functions } from '@angular/fire/functions';

jest.mock('@angular/fire/firestore', () => ({
  // We can include jest.requireActual if we want to keep some real implementations,
  // but for a full mock, we'll replace the ones we need.
  // ...jest.requireActual('@angular/fire/firestore'),

  // Mock the Firestore class if it's injected (often an empty object is enough if no direct methods are called on it)
  Firestore: jest.fn(),

  // Mock the collection function
  collection: jest.fn((firestoreInstance: Firestore, path: string) => ({
    // This mock collection reference object is returned by our mocked `collection` function
    // It's a simple object that satisfies the `CollectionReference` type implicitly.
    id: 'mock-collection-ref', // Add properties if the component expects them
    path: path,
    firestore: firestoreInstance, // Ensure it holds the mock firestore instance
  })),

  // Mock the collectionData function to return an Observable of test data
  collectionData: jest.fn((collectionRef: any, options?: any) =>
    of([
      { id: 'v20-item1', name: 'Existing Item One (v20)' },
      { id: 'v20-item2', name: 'Existing Item Two (v20)' },
    ])
  ),

  // Mock the addDoc function to return a resolved Promise
  addDoc: jest.fn((collectionRef: any, data: any) =>
    Promise.resolve({ id: 'newV20Id', path: `${collectionRef.path}/newV20Id` })
  ),
}));

describe('EntriesComponent', () => {
  let component: EntriesComponent;
  let fixture: ComponentFixture<EntriesComponent>;

  // Cast the mocked functions for easier type access in tests
  const mockFirestore = Firestore as jest.MockedFunction<any>;
  const mockCollection = collection as jest.MockedFunction<typeof collection>;
  const mockCollectionData = collectionData as jest.MockedFunction<
    typeof collectionData
  >;
  const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;

  beforeEach(async () => {
    // Reset mocks before each test to ensure isolation
    mockFirestore.mockClear();
    mockCollection.mockClear();
    mockCollectionData.mockClear();
    mockAddDoc.mockClear();
    await TestBed.configureTestingModule({
      imports: [EntriesComponent],
      providers: [
        // Provide the mock Firestore instance. Since the component uses functions like
        // `collection(this.firestore, 'items')`, the actual instance might not need methods,
        // but it needs to be provided. An empty object or a simple mock works.
        { provide: Firestore, useValue: {} },
        { provide: Functions, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
