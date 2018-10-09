import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';
import {Router} from '@angular/router';

import { environment } from '../../environments/environment';
import {User} from '../user-profile/user.model';
import {map} from 'rxjs/internal/operators';

const BACKEND_URL = environment.apiUrl + '/user';

@Injectable({providedIn: 'root'})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  // Getting the username from the server //
  findUsername(username: string) {
    const queryParams = `?username=${username}`;
    return this.http.get<{message: string, userId: string}>(BACKEND_URL + '/username' + queryParams);
  }
  //

  getUserById(userId: string) {
    return this.http.get<{message: string, user: User}>(BACKEND_URL + '/' + userId)
      .pipe(map(userData => {
        return {
          _id: userData.user._id,
          username: userData.user.username,
          firstName: userData.user.firstName,
          lastName: userData.user.lastName,
          dateOfBirth: userData.user.dateOfBirth,
          email: userData.user.email,
          aboutMe: userData.user.aboutMe,
          userImage: userData.user.userImage,
          userCountry: userData.user.userCountry,
          profession: userData.user.profession,
          memberSince: userData.user.memberSince
        };
      }));
  }

  createUser(username: string,
             firstName: string,
             lastName: string,
             dateOfBirth: string,
             email: string,
             password: string,
             aboutMe: string,
             userImage: File,
             userCountry: string,
             profession: string) {
    const authData = new FormData();
    authData.append('username', username);
    authData.append('firstName', firstName);
    authData.append('lastName', lastName);
    authData.append('dateOfBirth', dateOfBirth);
    authData.append('email', email);
    authData.append('password', password);
    authData.append('aboutMe', aboutMe);
    authData.append('image', userImage, username);
    authData.append('userCountry', userCountry);
    authData.append('profession', profession);

    this.http.post(BACKEND_URL + '/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  updateUser(username: string,
             firstName: string,
             lastName: string,
             dateOfBirth: string,
             email: string,
             aboutMe: string,
             userImage: File,
             userCountry: string,
             profession: string,
             userId: string) {
    const authData = {
      username: username,
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: dateOfBirth,
      email: email,
      aboutMe: aboutMe,
      userImage: userImage,
      userCountry: userCountry,
      profession: profession
    };

    this.http.put(BACKEND_URL + '/' + userId, authData)
      .subscribe(() => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL + '/login', authData)
      .subscribe(response => {
        this.token = response.token;
        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          console.log(expirationDate);
          this.saveAuthData(this.token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInfo.token;
      this.isAuthenticated = true;
      this.userId = authInfo.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }
}
