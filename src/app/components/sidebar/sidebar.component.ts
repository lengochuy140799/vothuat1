import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeTab: string = 'dashboard';
  @Input() openExamName: string = '';
  @Output() activeTabChange = new EventEmitter<string>();

  selectTab(tab: string) {
    this.activeTabChange.emit(tab);
  }
}
