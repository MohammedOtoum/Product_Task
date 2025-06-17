export class User {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
  password: string;
  passwordConfirm: string;

  constructor() {
    this.userId = 0;
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.gender = '';
    this.password = '';
    this.passwordConfirm = '';
  }
}
