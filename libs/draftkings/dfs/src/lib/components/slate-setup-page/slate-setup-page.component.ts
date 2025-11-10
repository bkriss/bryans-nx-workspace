import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectSlateComponent } from '../select-slate/select-slate.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Slate } from '../../enums';

@Component({
  selector: 'dfs-slate-setup-page',
  imports: [CommonModule, MatButtonModule, MatIconModule, SelectSlateComponent],
  templateUrl: './slate-setup-page.component.html',
  styleUrl: './slate-setup-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlateSetupPageComponent {
  selectedFile: File | null = null;
  fileContent: string | ArrayBuffer | null = null;
  slateEnum = Slate;

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
        console.log('slate', slate);
        console.log('typeOfFileContent', typeOfFileContent);

        if (typeOfFileContent === 'salaries') {
          if (
            this.fileContent?.toString().includes('Salary') &&
            !this.fileContent?.toString().includes('Contest ID')
          ) {
            // This is a salaries file
            console.log('This is a salaries file');
            console.log('fileContent', this.fileContent);
            // TODO: Use service from NgRx Signal Store to save file content to Firebase Firestore
          } else {
            // This is an entries file
            console.error(
              `This does not appear to be a DKSalaries file. Please check the file name and try again.`
            );
          }
        }

        if (typeOfFileContent === 'entries') {
          if (this.fileContent?.toString().includes('Contest ID')) {
            // This is an entries file
            console.log('This is an entries file');
            console.log('fileContent', this.fileContent);
            // TODO: Use service from NgRx Signal Store to save file content to Firebase Firestore
          } else {
            // This is not an entries file
            console.error(
              `This does not appear to be a DKEntries file. Please check the file name and try again.`
            );
          }
        }

        // Now you have the file content, you can store it locally
        // this.storeFileLocally(this.selectedFile!.name, this.fileContent);
      };
      reader.readAsText(this.selectedFile); // Or reader.readAsDataURL(this.selectedFile) for images
    }
  }

  fetchCsvFiles(): void {
    // TODO: Use service from NgRx Signal Store to fetch CSV files from Firebase Firestore
    // TODO: Fetch DKSalaries and DKEntries for the Main Slate
    // TODO: Fetch DKSalaries and DKEntries for the Early Only Slate
    // TODO: Fetch DKSalaries and DKEntries for the Sun-Mon Slate
  }

  help(): void {
    // TODO: Implement help functionality
    alert('Help functionality coming soon!');
  }
}
