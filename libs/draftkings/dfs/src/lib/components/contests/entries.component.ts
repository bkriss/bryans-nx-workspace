import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Input,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {
  convertJsonToCsv,
  downloadCsvFile,
  draftKingsEntries,
} from '../../utils';
import {
  DraftKingsEntry,
  Lineup,
  Player,
  TableFriendlyDraftKingsEntry,
} from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  lineupsForQb1,
  lineupsForQb2,
  lineupsForQb3,
  lineupsForQb4,
} from '../../utils/lineups';

@Component({
  selector: 'dfs-entries',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './entries.component.html',
  styleUrl: './entries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntriesComponent implements OnInit {
  @Input() numberOfQbs = 0;
  draftKingsEntries = draftKingsEntries;

  lineupsForQb1: WritableSignal<Lineup[]> = signal([]);
  lineupsForQb2: WritableSignal<Lineup[]> = signal([]);
  lineupsForQb3: WritableSignal<Lineup[]> = signal([]);
  lineupsForQb4: WritableSignal<Lineup[]> = signal([]);
  lineupsForAllQbs: Signal<Lineup[]> = computed(() => {
    // console.log('computing lineupsForAllQbs', this.lineupsForAllQbs());
    return [
      ...this.lineupsForQb1(),
      ...this.lineupsForQb2(),
      ...this.lineupsForQb3(),
      ...this.lineupsForQb4(),
    ];
  });

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
  ];
  entries: WritableSignal<TableFriendlyDraftKingsEntry[]> =
    signal(draftKingsEntries);

  ngOnInit(): void {
    console.log('EntriesComponent initialized');

    this.fetchLineupsForQb1();
    this.fetchLineupsForQb2();
    this.fetchLineupsForQb3();
    this.fetchLineupsForQb4();
  }

  renderEntryPosition(player: Player): string {
    return player?.id ? `${player.name} (${player.id})` : '- -';
  }

  assignLineupsToContests(): void {
    console.log('assignLineupsToContests');

    const sortedLineups = this.lineupsForAllQbs().sort(
      (a, b) => b.lineupGrade - a.lineupGrade
    );
    console.log('sortedLineups', sortedLineups);

    const defaultEntries: TableFriendlyDraftKingsEntry[] = this.entries().map(
      (entry, i) => {
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
        };
      }
    );

    console.log('defaultEntries', defaultEntries);

    this.entries.update(() => defaultEntries);
  }

  fetchLineupsForQb1(): void {
    console.log('fetchLineupsForQb1');

    // TODO: Replace with actual fetching logic
    this.lineupsForQb1.update(() => [...lineupsForQb1]);
  }

  fetchLineupsForQb2(): void {
    if (this.numberOfQbs < 2) return;
    console.log('fetchLineupsForQb2');

    // TODO: Replace with actual fetching logic
    this.lineupsForQb2.update(() => [...lineupsForQb2]);
  }

  fetchLineupsForQb3(): void {
    if (this.numberOfQbs < 3) return;
    console.log('fetchLineupsForQb3');

    // TODO: Replace with actual fetching logic
    this.lineupsForQb3.update(() => [...lineupsForQb3]);
  }

  fetchLineupsForQb4(): void {
    if (this.numberOfQbs < 4) return;
    console.log('fetchLineupsForQb4');

    // TODO: Replace with actual fetching logic
    this.lineupsForQb4.update(() => [...lineupsForQb4]);
  }

  downloadCsv(): void {
    const entries: DraftKingsEntry[] = this.entries().map((entry) => {
      return {
        'Entry ID': entry['Entry ID'],
        'Contest Name': entry['Contest Name'],
        'Contest ID': entry['Contest ID'],
        'Entry Fee': entry['Entry Fee'],
        QB: entry.QB_NAME,
        RB1: entry.RB1_NAME,
        RB2: entry.RB2_NAME,
        WR1: entry.WR1_NAME,
        WR2: entry.WR2_NAME,
        WR3: entry.WR3_NAME,
        TE: entry.TE_NAME,
        FLEX: entry.FLEX_NAME,
        DST: entry.DST_NAME,
      };
    });
    const csv = convertJsonToCsv(entries);
    downloadCsvFile(csv, 'draftkings-entries.csv');
  }
}
