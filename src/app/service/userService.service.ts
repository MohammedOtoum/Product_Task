import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { User } from '../model/class/Users';
import { GetUser } from '../model/class/getUser';
import { UserLogin } from '../model/class/userLogin';
import { LoginResponse } from '../model/interface/LoginResponse';
import { UserRefreshResponse } from '../model/interface/UserRefreshResponse';
import { SignupResponse } from '../model/interface/signupResponse';
import { Roles } from '../model/interface/Roles';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<GetUser[]> {
    return this.http.get<GetUser[]>('https://localhost:7217/api/Users');
  }
  getUserbyId(Id: number): Observable<GetUser> {
    return this.http.get<GetUser>('https://localhost:7217/api/Users/' + Id);
  }
  signupUser(user: User): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(
      'https://localhost:7217/api/Auth/signup',
      user
    );
  }
  loginUser(user: UserLogin): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      'https://localhost:7217/api/Auth/login',
      user
    );
  }

  refreshToken(): Observable<UserRefreshResponse> {
    const tokenString = localStorage.getItem('token');
    if (!tokenString) {
      // handle no token case, maybe return an error Observable or null
      return throwError(() => new Error('No token found'));
    }

    const tokenItem = JSON.parse(tokenString);

    if (tokenItem.expiry < Date.now()) {
      localStorage.removeItem('token');
      return throwError(() => new Error('Token expired'));
    }

    const token = tokenItem.value;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<UserRefreshResponse>(
      'https://localhost:7217/api/Auth/RefreshToken',
      {
        headers,
      }
    );
  }

  updateUserRole(userId: number, roleId: number): Observable<any> {
    const body = {
      userId: userId,
      roleId: roleId,
    };

    return this.http.put(
      'https://localhost:7217/api/Users/UpdateUserRole',
      body,
      { responseType: 'text' as 'json' } // ✅ لحل مشكلة parsing
    );
  }

  getRolebyUserId(id: number): Observable<number> {
    return this.http.get<number>(
      'https://localhost:7217/api/Users/GetUserRole/' + id
    );
  }
  getAllRoles(): Observable<Roles[]> {
    return this.http.get<Roles[]>(
      `https://localhost:7217/api/Users/GetAllRoles`
    );
  }
  getRolNamebyRoleId(id: number): Observable<string> {
    return this.http.get<string>(
      'https://localhost:7217/api/Users/GetRoleName/' + id
    );
  }
}
