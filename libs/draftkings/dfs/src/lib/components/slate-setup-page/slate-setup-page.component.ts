import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SelectSlateComponent } from '../select-slate/select-slate.component';
import { Slate } from '../../enums';
import { SlatesStore } from '../../store';

@Component({
  selector: 'dfs-slate-setup-page',
  imports: [CommonModule, MatButtonModule, MatIconModule, SelectSlateComponent],
  templateUrl: './slate-setup-page.component.html',
  styleUrl: './slate-setup-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlateSetupPageComponent implements OnInit {
  private readonly slatesStore = inject(SlatesStore);
  isLoading = this.slatesStore.isLoading;
  currentSlate = this.slatesStore.currentSlate;
  salaries = this.slatesStore.salaries;
  entries = this.slatesStore.entries;
  id = this.slatesStore.id;
  isSaving = this.slatesStore.isSaving;
  selectedFile: File | null = null;
  fileContent: string | ArrayBuffer | null = null;
  slateEnum = Slate;

  ngOnInit(): void {
    this.slatesStore.loadSlates();
  }

  onFileSelected(
    event: any,
    slate: Slate,
    typeOfFileContent: 'salaries' | 'entries'
  ): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fileContent = reader.result;

        if (typeOfFileContent === 'salaries') {
          if (
            this.fileContent?.toString().includes('Salary') &&
            !this.fileContent?.toString().includes('Contest ID')
          ) {
            console.log('salaries fileContent', this.fileContent);

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
            console.log('entries fileContent', this.fileContent);

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

  fetchCsvFiles(): void {
    // TODO: Use service from NgRx Signal Store to fetch CSV files from Firebase Firestore
    // TODO: Fetch DKSalaries and DKEntries for the Main Slate
    // TODO: Fetch DKSalaries and DKEntries for the Early Only Slate
    // TODO: Fetch DKSalaries and DKEntries for the Sun-Mon Slate
  }

  setSalaries(slate: Slate, fileContent: string): void {
    if (!fileContent?.length) return;

    if (slate === Slate.MAIN) {
      this.slatesStore.setMainSlateSalaries(fileContent);
    } else if (slate === Slate.EARLY_ONLY) {
      this.slatesStore.setEarlyOnlySlateSalaries(fileContent);
    } else if (slate === Slate.SUN_TO_MON) {
      this.slatesStore.setSunToMonSlateSalaries(fileContent);
    } else {
      console.error('Unknown slate selected');
    }
  }

  setEntries(slate: Slate, fileContent: string): void {
    if (!fileContent?.length) return;

    if (slate === Slate.MAIN) {
      this.slatesStore.setMainSlateEntries(fileContent);
    } else if (slate === Slate.EARLY_ONLY) {
      this.slatesStore.setEarlyOnlySlateEntries(fileContent);
    } else if (slate === Slate.SUN_TO_MON) {
      this.slatesStore.setSunMonSlateEntries(fileContent);
    } else {
      console.error('Unknown slate selected');
    }
  }

  help(): void {
    // TODO: Implement help functionality
    alert('Help functionality coming soon!');
  }
}
