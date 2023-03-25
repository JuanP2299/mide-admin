export class User {
  name: string;
  lastname: string;
  email: string;
  sets: Array<string>;
  idUser: string;
  role: string;
  isAdmin: string;
  idOrganizations: Array<string>;
  hasOpenQuestion: boolean;

  constructor(
    name: string = '',
    lastname: string = '',
    email: string = '',
    idUser: string = '',
    sets: Array<string> = [],
    role: string = '',
    isAdmin: string,
    idOrganizations: Array<string> = [],
    hasOpenQuestion: boolean = false
  ) {
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.idUser = idUser;
    this.sets = sets;
    this.role = role;
    this.isAdmin = isAdmin;
    this.idOrganizations = idOrganizations;
    this.hasOpenQuestion = hasOpenQuestion;
  }
}
