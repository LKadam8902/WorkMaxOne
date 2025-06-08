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
    { userId: 'r323qf', username: 'demo', email: 'demo123@gmail.com', role: 'Team Lead', status: 'Pending' },
    { userId: 'a123bc', username: 'alice', email: 'alice@example.com', role: 'Engineer', status: 'Pending' },
    { userId: 'b456de', username: 'bob', email: 'bob@example.com', role: 'Designer', status: 'Pending' },
  ];

  approve(row: any) {
    row.status = 'Approved';
  }
}
