export class GetUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  passwordSalt: string;
  passwordHash: string;

  constructor() {
    this.userId = 0;
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.gender = '';
    this.passwordSalt = '';
    this.passwordHash = '';
  }
}
