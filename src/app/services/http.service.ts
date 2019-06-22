import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {BalloonMessageFactoryService} from '../balloon-message/balloon-message-factory.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  username = '';

  private authSecretVar = '';

  constructor(private http: HttpClient, private router: Router, private balloon: BalloonMessageFactoryService) {
    this.authSecret = localStorage.getItem('authSecret') || '';
  }

  set authSecret(val: string) {
    this.authSecretVar = val;
    localStorage.setItem('authSecret', val);
  }

  logout() {
    this.authSecret = '';
    this.username = '';
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/']);
  }

  get(url: string, fetchUsernameIfNeeded = true): Observable<any> {
    if (fetchUsernameIfNeeded && this.username.length === 0) {
      this.getUsername();
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('sg-auth', this.authSecretVar);

    return new Observable((observer) => {

      this.http.get<ApiResponse>(url, {headers}).subscribe(resp => {
        if (resp.status === 'needsLogin') {
          console.log('needsLogin');
          // noinspection JSIgnoredPromiseFromCall
          this.router.navigate(['/login']);
          observer.next(null);
        } else if (resp.status === 'error') {
          this.balloon.show(resp.message, 'error');
          observer.next(null);
        } else {
          observer.next(resp.message);
        }
      }, error => {
        this.balloon.show('Error when communicating with the server', 'error');
        console.log(error);
      });
    });
  }

  post(url: string, data: any): Observable<any> {
    if (this.username.length === 0) {
      this.getUsername();
    }

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('sg-auth', this.authSecretVar);

    return new Observable((observer) => {

      this.http.post<ApiResponse>(url, data, {headers}).subscribe(resp => {
        if (resp.status === 'needsLogin') {
          console.log('needsLogin');
          // noinspection JSIgnoredPromiseFromCall
          this.router.navigate(['/login']);
          observer.next(null);
        } else if (resp.status === 'error') {
          this.balloon.show(resp.message, 'error');
          observer.next(null);
        } else {
          observer.next(resp.message);
        }
      });
    });
  }

  getUsername(): Observable<string> {
    const r = this.get('/api/user/whoami', false);
    r.subscribe(rr => this.username = rr.trim());
    return r;
  }

  checkPassword(password): Observable<boolean> {
    return this.post('/api/user/password/check', {password});
  }

  changePassword(newPassword): Observable<boolean> {
    return this.post('/api/user/password/change', {password: newPassword});
  }
}

interface ApiResponse {
  status: string;
  message: any;
}
