import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dk-shared-file-upload-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './file-upload-button.component.html',
  styleUrl: './file-upload-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadButtonComponent {
  @Input() allowMultipleFiles = false;
  @Input() buttonStyle: 'primary' | 'secondary' = 'primary';
  @Input() buttonText = 'Upload File';
  @Input() isButtonDisabled = false;
  @Output() handleFileSelection = new EventEmitter<Event>();
}
