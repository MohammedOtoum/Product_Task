import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../model/class/Users';
import { UserService } from '../../service/userService.service';
import { FormsModule } from '@angular/forms';
import { SignupResponse } from '../../model/interface/signupResponse';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-signUp',
  imports: [FormsModule, TranslateModule],
  templateUrl: './signUp.component.html',
  styleUrls: ['./signUp.component.css'],
})
export class SignUpComponent implements OnInit {
  userService = inject(UserService);
  userObj: User = new User();
  currentLang = 'en';

  constructor(private router: Router, private translate: TranslateService) {}

  ngOnInit() {}

  SignUp(user: User) {
    this.userService.signupUser(user).subscribe((res: SignupResponse) => {
      alert(res.message);
      this.userObj = new User();
      this.router.navigate(['/login']);
    });
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
