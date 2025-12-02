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
}
