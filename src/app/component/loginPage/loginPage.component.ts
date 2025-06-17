import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserLogin } from '../../model/class/userLogin';
import { UserService } from '../../service/userService.service';
import { LoginResponse } from '../../model/interface/LoginResponse';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-loginPage',
  imports: [RouterLink, CommonModule, FormsModule, TranslateModule],
  templateUrl: './loginPage.component.html',
  styleUrls: ['./loginPage.component.css'],
})
export class LoginPageComponent implements OnInit {
  currentLang = 'en';
  userLogin: UserLogin = new UserLogin();
  constructor(
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) {}

  path: string = '';

  ngOnInit() {}

  Login(user: UserLogin) {
    this.userService.loginUser(user).subscribe((res: LoginResponse) => {
      const token = res.token;
      const expireTime = 60;

      const now = new Date();
      const item = {
        value: token,
        expiry: now.getTime() + expireTime * 60 * 1000,
      };
      localStorage.setItem('token', JSON.stringify(item));
      if (this.userLogin.email == 'admin@gmail.com') {
        this.router.navigate(['/product']);
      } else {
        this.router.navigate(['/userProducts']);
      }
    });
  }
  switchLanguage(lang: string) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
