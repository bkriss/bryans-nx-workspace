import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import {
  DraftKingsEntry,
  Player,
  SimpleLineup,
  TableFriendlyDraftKingsEntry,
  Slate,
  LineupsStore,
  SlatesStore,
} from '@bryans-nx-workspace/draftkings-shared';
import {
  convertJsonToCsv,
  downloadCsvFile,
  renderDraftKingsEntriesAsJson,
} from '../../utils';

@Component({
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './entries.component.html',
  styleUrl: './entries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntriesComponent {
  private readonly slatesStore = inject(SlatesStore);
  private readonly lineupsStore = inject(LineupsStore);
  readonly loadingLineups = this.lineupsStore.isLoading;
  readonly loadingSlates = this.slatesStore.isLoading;

  currentSlate = this.slatesStore.currentSlate;
  draftKingsEntries = this.slatesStore.entriesForCurrentSlate;
  isLoading = computed(() => this.loadingSlates() || this.loadingLineups());
  lineupsForQb1 = this.lineupsStore.lineupsForQb1;
  lineupsForQb2 = this.lineupsStore.lineupsForQb2;
  lineupsForQb3 = this.lineupsStore.lineupsForQb3;
  lineupsForQb4 = this.lineupsStore.lineupsForQb4;
  lineupsForQb5 = this.lineupsStore.lineupsForQb5;
  lineupsForQb6 = this.lineupsStore.lineupsForQb6;
  lineupsForAllQbs: Signal<SimpleLineup[]> = computed(() => {
    return [
      ...this.lineupsForQb1(),
      ...this.lineupsForQb2(),
      ...this.lineupsForQb3(),
      ...this.lineupsForQb4(),
      ...this.lineupsForQb5(),
      ...this.lineupsForQb6(),
    ].sort((a, b) => b.lineupScore - a.lineupScore);
  });
  loadedLineups: WritableSignal<boolean> = signal(false);
  numberOfLineupsMatchNumberOfEntries = computed(() => {
    return this.lineupsForAllQbs().length === this.entries().length;
  });

  displayedColumns: string[] = [
    'entryFee',
    'topPrize',
    'contestSize',
    'QB',
    'RB1',
    'RB2',
    'WR1',
    'WR2',
    'WR3',
    'TE',
    'FLEX',
    'DST',
    'lineupGrade',
    'totalProjectedPoints',
    'lineupScore',
  ];
  entries = computed(() => {
    return this.assignLineupsToContests(this.lineupsForAllQbs());
  });

  constructor() {
    effect(() => {
      const entriesForCurrentSlate = this.slatesStore.entriesForCurrentSlate();

      if (
        !this.loadingSlates() &&
        entriesForCurrentSlate &&
        !this.loadedLineups()
      ) {
        this.loadedLineups.set(true);
        this.lineupsStore.loadLineupsFromFirestore();
      }
    });
  }

  renderEntryPosition(player: Player): string {
    return player?.id ? `${player.name} (${player.id})` : '- -';
  }

  mapLineupsToEntries(
    entries: TableFriendlyDraftKingsEntry[],
    lineups: SimpleLineup[]
  ): TableFriendlyDraftKingsEntry[] {
    const sortedLineups = lineups.sort((a, b) => b.lineupScore - a.lineupScore);
    return entries
      .sort((a, b) => b.contestScore - a.contestScore)
      .map((entry, i) => {
        const qb = sortedLineups[i]?.qb as Player;
        const rb1 = sortedLineups[i]?.rb1 as Player;
        const rb2 = sortedLineups[i]?.rb2 as Player;
        const wr1 = sortedLineups[i]?.wr1 as Player;
        const wr2 = sortedLineups[i]?.wr2 as Player;
        const wr3 = sortedLineups[i]?.wr3 as Player;
        const te = sortedLineups[i]?.te as Player;
        const flex = sortedLineups[i]?.flex as Player;
        const dst = sortedLineups[i]?.dst as Player;

        return {
          ...entry,
          QB: this.renderEntryPosition(qb),
          RB1: this.renderEntryPosition(rb1),
          RB2: this.renderEntryPosition(rb2),
          WR1: this.renderEntryPosition(wr1),
          WR2: this.renderEntryPosition(wr2),
          WR3: this.renderEntryPosition(wr3),
          TE: this.renderEntryPosition(te),
          FLEX: this.renderEntryPosition(flex),
          DST: this.renderEntryPosition(dst),
          QB_NAME: qb?.nameAbbrev || '',
          RB1_NAME: rb1?.nameAbbrev || '',
          RB2_NAME: rb2?.nameAbbrev || '',
          WR1_NAME: wr1?.nameAbbrev || '',
          WR2_NAME: wr2?.nameAbbrev || '',
          WR3_NAME: wr3?.nameAbbrev || '',
          TE_NAME: te?.nameAbbrev || '',
          FLEX_NAME: flex?.nameAbbrev || '',
          DST_NAME: dst?.nameAbbrev || '',
          lineupGrade: sortedLineups[i]?.lineupGrade || 0,
          lineupScore: sortedLineups[i]?.lineupScore || 0,
          totalProjectedPoints: sortedLineups[i]?.totalProjectedPoints || 0,
        };
      });
  }

  assignLineupsToContests(
    lineupsForAllQbs: SimpleLineup[]
  ): TableFriendlyDraftKingsEntry[] {
    const lineupsForLargeFieldContests = lineupsForAllQbs
      .filter((lineup) => {
        const { wr1, wr2, wr3, te, flex } = lineup;

        return (
          wr1?.onlyUseInLargerFieldContests ||
          wr2?.onlyUseInLargerFieldContests ||
          wr3?.onlyUseInLargerFieldContests ||
          te?.onlyUseInLargerFieldContests ||
          flex?.onlyUseInLargerFieldContests
        );
      })
      .sort((a, b) => b.lineupScore - a.lineupScore);

    const lineupsForRemainingContests = lineupsForAllQbs
      .filter((lineup) => {
        const { wr1, wr2, wr3, te, flex } = lineup;

        return (
          !wr1?.onlyUseInLargerFieldContests &&
          !wr2?.onlyUseInLargerFieldContests &&
          !wr3?.onlyUseInLargerFieldContests &&
          !te?.onlyUseInLargerFieldContests &&
          !flex?.onlyUseInLargerFieldContests
        );
      })
      .sort((a, b) => b.lineupScore - a.lineupScore);

    const entriesSortedBySize = [
      ...renderDraftKingsEntriesAsJson(this.draftKingsEntries()),
    ].sort((a, b) => b.contestSize - a.contestSize);
    const largerFieldEntries = entriesSortedBySize.slice(
      0,
      lineupsForLargeFieldContests.length
    );
    const remainingEntries = entriesSortedBySize.slice(
      largerFieldEntries.length
    );

    const mappedEntriesForLargeFieldContests = this.mapLineupsToEntries(
      largerFieldEntries,
      lineupsForLargeFieldContests
    );
    const mappedEntriesForRemainingContests = this.mapLineupsToEntries(
      remainingEntries,
      lineupsForRemainingContests
    );

    const entries: TableFriendlyDraftKingsEntry[] = [
      ...mappedEntriesForRemainingContests,
      ...mappedEntriesForLargeFieldContests,
    ].sort((a, b) => b.contestScore - a.contestScore);

    return entries;
  }

  downloadCsv(): void {
    const entries: DraftKingsEntry[] = this.entries().map((entry) => {
      return {
        'Entry ID': entry['Entry ID'],
        'Contest Name': entry['Contest Name'],
        'Contest ID': entry['Contest ID'],
        'Entry Fee': entry['Entry Fee'],
        QB: entry.QB,
        RB1: entry.RB1,
        RB2: entry.RB2,
        WR1: entry.WR1,
        WR2: entry.WR2,
        WR3: entry.WR3,
        TE: entry.TE,
        FLEX: entry.FLEX,
        DST: entry.DST,
      };
    });

    let csvFileName = 'draftkings-entries-main-slate.csv';
    if (this.currentSlate() === Slate.EARLY_ONLY) {
      csvFileName = csvFileName.replace('main-slate', 'early-only');
    } else if (this.currentSlate() === Slate.AFTERNOON_ONLY) {
      csvFileName = csvFileName.replace('main-slate', 'afternoon-only');
    } else if (this.currentSlate() === Slate.SUN_TO_MON) {
      csvFileName = csvFileName.replace('main-slate', 'sun-to-mon');
    }

    const csv = convertJsonToCsv(entries)
      .replace('RB1', 'RB')
      .replace('RB2', 'RB')
      .replace('WR1', 'WR')
      .replace('WR2', 'WR')
      .replace('WR3', 'WR');

    downloadCsvFile(csv, csvFileName);
  }
}
