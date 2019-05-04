import {Component, OnInit} from '@angular/core';
import {HttpService} from '../services/http.service';
import {BalloonMessageFactoryService} from '../balloon-message/balloon-message-factory.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  protected email = '';
  protected password = '';


  constructor(private http: HttpService, private balloonMsg: BalloonMessageFactoryService, private router: Router) {
  }

  ngOnInit() {
  }

  login() {
    this.http.post('/api/login', {mail: this.email, password: this.password}).subscribe(resp => {
      switch (resp.login) {
        case 'ok':
          this.balloonMsg.show('Login successful', 'success');
          this.http.authSecret = resp.key;
          // noinspection JSIgnoredPromiseFromCall
          this.router.navigate(['/control']);
          break;
        case 'failed':
          this.balloonMsg.show('Wrong username or password', 'error');
          break;
        default:
          this.balloonMsg.show('Server error', 'error');
      }
    });
  }
}