import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
  Position,
  PlayerSelectionStore,
  SlatesStore,
  PlayerProjectionsStore,
} from '@bryans-nx-workspace/draftkings-shared';
import { SortPlayerPoolComponent } from '../sort-player-pool/sort-player-pool.component';
import { SortPassCatcherPoolComponentComponent } from '../sort-pass-catcher-pool/sort-pass-catcher-pool.component';
import { draftKingsPlayersWithScoringProjections } from '../../utils';
import { QbPassCatcherOwnershipComponent } from '../qb-pass-catcher-ownership/qb-pass-catcher-ownership.component';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    QbPassCatcherOwnershipComponent,
    ReactiveFormsModule,
    SortPassCatcherPoolComponentComponent,
    SortPlayerPoolComponent,
  ],
  templateUrl: './player-pool-selection.component.html',
  styleUrl: './player-pool-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPoolSelectionComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('stepper') stepper: MatStepper | undefined;
  private readonly router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly playerSelectionStore = inject(PlayerSelectionStore);
  private readonly playerProjectionsStore = inject(PlayerProjectionsStore);
  private readonly slatesStore = inject(SlatesStore);

  // TODO: Remove subscriptions and refactor once Signal Forms is stable
  private qbChangesSubscription: Subscription = new Subscription();
  private rbChangesSubscription: Subscription = new Subscription();
  private wrChangesSubscription: Subscription = new Subscription();
  private teChangesSubscription: Subscription = new Subscription();
  private dstChangesSubscription: Subscription = new Subscription();

  availablePlayers = computed(() =>
    draftKingsPlayersWithScoringProjections(
      this.slatesStore.rawDkPlayersForCurrentSlate(),
      this.playerProjectionsStore.projections()
    )
  );
  availableQuarterbacks = computed(() => this.availablePlayers().quarterbacks);
  availableRunningBacks = computed(() => this.availablePlayers().runningBacks);
  availableWideReceivers = computed(
    () => this.availablePlayers().wideReceivers
  );
  availableTightEnds = computed(() => this.availablePlayers().tightEnds);
  availableDsts = computed(() => this.availablePlayers().defenses);
  loadingSlateData = this.slatesStore.isLoading;
  loadingProjections = this.playerProjectionsStore.isLoading;
  isLoading = computed(
    () => this.loadingSlateData() || this.loadingProjections()
  );
  position = Position;
  playerSelectionsLoaded = signal(false);
  projectionsAddedToPlayers = signal(false);
  selectedQuarterbacks = this.playerSelectionStore.quarterbacks;
  selectedRunningBacks = this.playerSelectionStore.runningBacks;
  selectedWideReceivers = this.playerSelectionStore.wideReceivers;
  selectedTightEnds = this.playerSelectionStore.tightEnds;
  selectedDefenses = this.playerSelectionStore.defenses;

  // TODO: Conditionally set minLength and maxLength validators based on slate size
  qbSelectionFormGroup = this._formBuilder.group({
    qbPoolCtrl: [
      this.selectedQuarterbacks() as Quarterback[],
      [Validators.required, Validators.minLength(4), Validators.maxLength(6)],
    ],
  });
  rbSelectionFormGroup = this._formBuilder.group({
    rbPoolCtrl: [
      this.selectedRunningBacks() as RunningBack[],
      [Validators.required, Validators.minLength(10), Validators.maxLength(18)],
    ],
  });
  wrSelectionFormGroup = this._formBuilder.group({
    wrPoolCtrl: [
      this.selectedWideReceivers() as PassCatcher[],
      [Validators.required, Validators.minLength(35), Validators.maxLength(50)],
    ],
  });
  teSelectionFormGroup = this._formBuilder.group({
    tePoolCtrl: [
      this.selectedTightEnds() as PassCatcher[],
      [Validators.required, Validators.minLength(6), Validators.maxLength(15)],
    ],
  });
  dstSelectionFormGroup = this._formBuilder.group({
    dstPoolCtrl: [
      this.selectedDefenses() as Player[],
      [Validators.required, Validators.minLength(8), Validators.maxLength(15)],
    ],
  });

  constructor() {
    // Effect to load player pools after slates are successfully loaded
    effect(() => {
      const loadingSlateData = this.slatesStore.isLoading();
      const currentSlate = this.slatesStore.currentSlate();

      // When loading completes and we have a valid slate, load player pools
      if (!loadingSlateData && currentSlate && !this.playerSelectionsLoaded()) {
        this.playerSelectionsLoaded.set(true);
        this.playerSelectionStore.loadSelectedPlayersFromFirestore();
      }
    });

    // Effect to update form controls when player pools are loaded from Firestore
    // TODO: Potentially remove and/or refactor once Signal Forms is stable
    effect(() => {
      const qbs = this.selectedQuarterbacks();
      const rbs = this.selectedRunningBacks();
      const wrs = this.selectedWideReceivers();
      const tes = this.selectedTightEnds();
      const dsts = this.selectedDefenses();

      // Update form controls with loaded data (without emitting events to avoid circular updates)
      this.qbSelectionFormGroup.controls.qbPoolCtrl.setValue(qbs, {
        emitEvent: false,
      });
      this.rbSelectionFormGroup.controls.rbPoolCtrl.setValue(rbs, {
        emitEvent: false,
      });
      this.wrSelectionFormGroup.controls.wrPoolCtrl.setValue(wrs, {
        emitEvent: false,
      });
      this.teSelectionFormGroup.controls.tePoolCtrl.setValue(tes, {
        emitEvent: false,
      });
      this.dstSelectionFormGroup.controls.dstPoolCtrl.setValue(dsts, {
        emitEvent: false,
      });
    });
  }

  ngOnInit(): void {
    this.updateSignalsWhenFormValuesChange();
    this.playerProjectionsStore.loadPlayerScoringProjections();
  }

  ngAfterViewInit(): void {
    this.getUrlQueryParams();
  }

  // TODO: Remove ngOnDestroy and refactor once Signal Forms is stable
  ngOnDestroy() {
    this.qbChangesSubscription.unsubscribe();
    this.rbChangesSubscription.unsubscribe();
    this.wrChangesSubscription.unsubscribe();
    this.teChangesSubscription.unsubscribe();
    this.dstChangesSubscription.unsubscribe();
  }

  getUrlQueryParams(): void {
    this.activatedRoute.queryParamMap.subscribe((params: ParamMap) => {
      const step = Number(params.get('step') || 1);
      this.goToStep(step);
    });
  }

  goToStep(step: number): void {
    if (this.stepper) {
      this.stepper.selectedIndex = step - 1;
    }
  }

  selectPlayersBasedOnProjections(position: Position) {
    if (position === Position.QB) {
      this.playerSelectionStore.setQuarterbacks(
        [...this.availableQuarterbacks()]
          .sort(
            (a, b) => b.projectedPointsPerDollar - a.projectedPointsPerDollar
          )
          .slice(0, 15)
      );
    } else if (position === Position.RB) {
      this.playerSelectionStore.setRunningBacks(
        [...this.availableRunningBacks()]
          .sort(
            (a, b) => b.projectedPointsPerDollar - a.projectedPointsPerDollar
          )
          .slice(0, 25)
      );
    } else if (position === Position.WR) {
      this.playerSelectionStore.setWideReceivers(
        [...this.availableWideReceivers()]
          .sort(
            (a, b) => b.projectedPointsPerDollar - a.projectedPointsPerDollar
          )
          .slice(0, 50)
      );
    } else if (position === Position.TE) {
      this.playerSelectionStore.setTightEnds(
        [...this.availableTightEnds()]
          .sort(
            (a, b) => b.projectedPointsPerDollar - a.projectedPointsPerDollar
          )
          .slice(0, 20)
      );
    } else if (position === Position.DST) {
      this.playerSelectionStore.setDefenses(
        [...this.availableDsts()]
          .sort(
            (a, b) => b.projectedPointsPerDollar - a.projectedPointsPerDollar
          )
          .slice(0, 20)
      );
    }
  }

  // TODO: Remove updateSignalsWhenFormValuesChange and refactor once Signal Forms is stable
  updateSignalsWhenFormValuesChange() {
    this.qbChangesSubscription =
      this.qbSelectionFormGroup.controls.qbPoolCtrl.valueChanges.subscribe(
        (selectedQbs) => {
          this.playerSelectionStore.setQuarterbacks(selectedQbs || []);
        }
      );
    this.rbChangesSubscription =
      this.rbSelectionFormGroup.controls.rbPoolCtrl.valueChanges.subscribe(
        (selectedRBs) => {
          this.playerSelectionStore.setRunningBacks(selectedRBs || []);
        }
      );
    this.wrChangesSubscription =
      this.wrSelectionFormGroup.controls.wrPoolCtrl.valueChanges.subscribe(
        (selectedWRs) => {
          this.playerSelectionStore.setWideReceivers(selectedWRs || []);
        }
      );
    this.teChangesSubscription =
      this.teSelectionFormGroup.controls.tePoolCtrl.valueChanges.subscribe(
        (selectedTEs) => {
          this.playerSelectionStore.setTightEnds(selectedTEs || []);
        }
      );
    this.dstChangesSubscription =
      this.dstSelectionFormGroup.controls.dstPoolCtrl.valueChanges.subscribe(
        (selectedDSTs) => {
          this.playerSelectionStore.setDefenses(selectedDSTs || []);
        }
      );
  }

  saveQbSelections() {
    this.playerSelectionStore.saveSelectedPlayersToFirestore(Position.QB);
  }

  saveRBSelections() {
    this.playerSelectionStore.saveSelectedPlayersToFirestore(Position.RB);
  }

  saveWRSelections() {
    this.playerSelectionStore.saveSelectedPlayersToFirestore(Position.WR);
  }

  saveTightEndSelections() {
    this.playerSelectionStore.saveSelectedPlayersToFirestore(Position.TE);
  }

  saveDSTSelections() {
    this.playerSelectionStore.saveSelectedPlayersToFirestore(Position.DST);
  }

  generateLineupBuilders() {
    this.router.navigate(['/dfs/lineup-builders']);
  }

  stepChanged(event: StepperSelectionEvent) {
    const newQueryParams: Params = {
      step: event.selectedIndex + 1,
    };

    this.router.navigate(
      [], // empty path array means stay on the current route
      {
        relativeTo: this.activatedRoute, // navigate relative to the current activated route
        queryParams: newQueryParams, // set the new query params
        queryParamsHandling: 'merge', // merge with existing query params
        // Use 'replaceUrl: true' to avoid adding a new entry to the browser history
        // replaceUrl: true
      }
    );
  }
}
