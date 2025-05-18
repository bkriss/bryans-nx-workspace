import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxListComponent, DxListModule } from 'devextreme-angular';
import { ItemClickEvent, SelectionChangedEvent } from 'devextreme/ui/list';

@Component({
  selector: 'shared-bbr-list',
  standalone: true,
  imports: [CommonModule, DxListModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() items: any[] = [];
  @Output() selectionChanged = new EventEmitter<any>();
  @Output() reorderItems = new EventEmitter<any[]>();
  @ViewChild(DxListComponent, { static: false }) list!: DxListComponent;

  onItemReordered() {
    const reorderedItems = this.list.items.map((item, i) => ({
      ...item,
      rank: i + 1,
    }));
    this.reorderItems.emit(reorderedItems);
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    const selectedItem = event.addedItems[0];
    this.selectionChanged.emit(selectedItem);
  }

  onItemClick(event: ItemClickEvent) {
    const selectedItem = event.itemData;
    this.selectionChanged.emit(selectedItem);
  }
}
