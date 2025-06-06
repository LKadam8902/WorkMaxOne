import { Component, OnInit } from '@angular/core';


interface User {
  userId: string;
  username: string;
  userEmailId: string;
  userRole: string;
  permit: boolean;
}

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {

  users: User[] = [];

  constructor() { }

  ngOnInit(): void {
    this.users = [
      {
        userId: 'r323qf',
        username: 'demo',
        userEmailId: 'demo123@gmail.com',
        userRole: 'Team Lead',
        permit: true
      },
    ];
  }
  savePermitChanges(): void {
    console.log('User permit changes:', this.users);
  }
}