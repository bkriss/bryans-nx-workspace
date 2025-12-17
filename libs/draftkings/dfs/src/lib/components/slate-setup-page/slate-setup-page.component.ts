import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  csvToJson,
  DfsPlatform,
  FantasyFootballersProjections,
  FileUploadButtonComponent,
  MappedFantasyFootballersPlayer,
  PlayerProjectionsStore,
  RawFantasyFootballersPlayer,
  Slate,
  SlatesStore,
} from '@bryans-nx-workspace/draftkings-shared';
import { SelectSlateComponent } from '../select-slate/select-slate.component';

@Component({
  selector: 'dfs-slate-setup-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SelectSlateComponent,
    FileUploadButtonComponent,
  ],
  templateUrl: './slate-setup-page.component.html',
  styleUrl: './slate-setup-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlateSetupPageComponent {
  private readonly slatesStore = inject(SlatesStore);
  private readonly playerProjectionsStore = inject(PlayerProjectionsStore);
  isLoading = this.slatesStore.isLoading;
  currentSlate = this.slatesStore.currentSlate;
  salaries = this.slatesStore.salaries;
  entries = this.slatesStore.entries;
  id = this.slatesStore.id;
  isSaving = this.slatesStore.isSaving;
  selectedFile: File | null = null;
  scoringProjectionsFiles: FileList = new DataTransfer().files;
  fileContent: string | ArrayBuffer | null = null;
  slateEnum = Slate;

  handleProjectionsCsvBatch(event: Event): void {
    this.scoringProjectionsFiles =
      (event.target as HTMLInputElement)?.files ?? new DataTransfer().files;

    if (!this.scoringProjectionsFiles.length) {
      console.warn('No files selected.');
      return;
    }

    let projections: Partial<FantasyFootballersProjections> = {};

    for (const file of Object.values(this.scoringProjectionsFiles)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = reader.result;
        const processedContent =
          this.renderFantasyFootballersScoringProjectionsAsJson(
            String(fileContent)
          );

        // TODO: Implement more robust file type detection
        const isRbProjectionsFile = file.name.includes('(1)');
        const isWrProjectionsFile = file.name.includes('(2)');
        const isTeProjectionsFile = file.name.includes('(3)');
        const isDstProjectionsFile = file.name.includes('(4)');

        if (isRbProjectionsFile) {
          projections = {
            ...projections,
            runningBacks: processedContent.filter(
              (rb) => rb.projectedPoints >= 8
            ),
          };
        } else if (isWrProjectionsFile) {
          projections = {
            ...projections,
            wideReceivers: processedContent.filter(
              (wr) => wr.projectedPoints >= 5
            ),
          };
        } else if (isTeProjectionsFile) {
          projections = {
            ...projections,
            tightEnds: processedContent.filter((te) => te.projectedPoints >= 5),
          };
        } else if (isDstProjectionsFile) {
          projections = { ...projections, defenses: processedContent };
        } else {
          projections = {
            ...projections,
            quarterbacks:
              processedContent.filter((qb) => qb.projectedPoints >= 8) || [],
          };
        }
      };
      reader.readAsText(file);
      reader.onloadend = () => {
        this.playerProjectionsStore.saveScoringProjectionsToFirestore(
          DfsPlatform.DRAFT_KINGS,
          projections
        );
      };
    }
  }

  onFileSelected(
    event: Event,
    slate: Slate,
    typeOfFileContent: 'salaries' | 'entries'
  ): void {
    this.selectedFile = (event.target as HTMLInputElement)?.files?.[0] ?? null;
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fileContent = reader.result;

        if (typeOfFileContent === 'salaries') {
          if (
            this.fileContent?.toString().includes('Salary') &&
            !this.fileContent?.toString().includes('Contest ID')
          ) {
            this.slatesStore.updateSlateData({
              salaries: {
                [slate]: String(this.fileContent),
              } as Record<Slate, string>,
            });
          } else {
            console.error(
              `This does not appear to be a DKSalaries file. Please check the file name and try again.`
            );
          }
        }

        if (typeOfFileContent === 'entries') {
          if (this.fileContent?.toString().includes('Contest ID')) {
            this.slatesStore.updateSlateData({
              entries: {
                [slate]: String(this.fileContent),
              } as Record<Slate, string>,
            });
          } else {
            console.error(
              `This does not appear to be a DKEntries file. Please check the file name and try again.`
            );
          }
        }
      };
      reader.readAsText(this.selectedFile);
    }
  }

  help(): void {
    // TODO: Implement help functionality
    alert('Help functionality coming soon!');
  }

  renderFantasyFootballersScoringProjectionsAsJson(
    csvData: string
  ): MappedFantasyFootballersPlayer[] {
    return csvToJson(csvData).map(
      (player: RawFantasyFootballersPlayer): MappedFantasyFootballersPlayer => {
        const name = player['"Name"'].replace(/"/g, '');
        const teamAbbrev = player['"Team"'].replace(/"/g, '');
        return {
          id: `${name}-${teamAbbrev}`
            .toLowerCase()
            .replace(/\./g, '')
            .replace(/ /g, ''),
          name,
          projectedPoints: Number(player['"PTS"'].replace(/"/g, '')),
          teamAbbrev,
        };
      }
    );
  }
}
