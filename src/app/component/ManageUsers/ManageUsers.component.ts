import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/userService.service';
import { GetUser } from '../../model/class/getUser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Roles } from '../../model/interface/Roles';
import { UserRole } from '../../model/interface/UserRole';

@Component({
  selector: 'app-ManageUsers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ManageUsers.component.html',
  styleUrls: ['./ManageUsers.component.css'],
})
export class ManageUsersComponent implements OnInit {
  users: GetUser[] = [];
  roles: Roles[] = [];
  roleId: number = Number(localStorage.getItem('roleId'));

  // لتخزين اسم الدور الحالي لكل مستخدم
  currentRoleNames: { [userId: number]: string } = {};

  // لتخزين الدور المختار من القائمة
  selectedRoles: { [userId: number]: number } = {};

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.userService.getAllRoles().subscribe((roles: Roles[]) => {
      this.roles = roles;
      this.loadUsers();
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe((users: GetUser[]) => {
      this.users = users;

      this.users.forEach((user) => {
        this.userService.getRolebyUserId(user.userId).subscribe({
          next: (roleId: number) => {
            const role = this.roles.find((r) => r.roleId === roleId);
            this.currentRoleNames[user.userId] = role
              ? role.roleName
              : 'Unknown';

            // تحديد القيمة المختارة تلقائيًا
            this.selectedRoles[user.userId] = roleId;
          },
          error: () => {
            this.currentRoleNames[user.userId] = 'Unknown';
          },
        });
      });
    });
  }

  updateUserRole(user: GetUser) {
    const roleId = this.selectedRoles[user.userId]; // تأكد أن selectedRoles يحتوي القيم

    if (!roleId) {
      alert('Please select a role before saving.');
      this.loadUsers();
      return;
    }

    this.userService.updateUserRole(user.userId, roleId).subscribe({
      next: () => alert(`Role updated for ${user.firstName}`),
      error: (err) => alert('Failed to update role: ' + err.message),
    });
  }
}
