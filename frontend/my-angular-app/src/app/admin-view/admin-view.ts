import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule], // ✅ fix added here
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent {
  adminData = [
    { name: 'John Doe', role: 'Engineer', status: 'Pending' },
    { name: 'Jane Smith', role: 'Manager', status: 'Pending' },
    { name: 'Bob Brown', role: 'Designer', status: 'Pending' },
  ];

  approve(row: any) {
    row.status = 'Approved';
    alert(`${row.name} approved!`);
  }
}
