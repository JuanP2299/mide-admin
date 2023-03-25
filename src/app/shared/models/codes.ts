export class Code {
  idOrganization: string;
  idCode: string;
  email: string;
  idCategory: string;
  idGroup: string;
  setName: string;
  status: string;
  usedAt: number;
  limitAt: number;
  createdAt: number;
  firstName: string;
  lastName: string;
  deleteAction: boolean;
  idUser: string;
  profession: string;

  public static parse(item: any): Code {
    const code = new Code();
    code.idOrganization = item.idOrganization;
    code.idCode = item.idCode;
    code.email = item.email;
    code.idCategory = item.idCategory;
    code.idGroup = item.idGroup;
    code.setName = item.setName;
    code.status = item.status;
    code.usedAt = item.usedAt;
    code.limitAt = item.limitAt;
    code.createdAt = item.createdAt;
    code.firstName = item.firstName;
    code.lastName = item.lastName;
    code.idUser = item.idUser;
    code.profession = item.profession;
    return code;
  }

  constructor(
    idCode: string = '',
    idOrganization: string = '',
    email: string = '',
    idCategory: string = '',
    idGroup: string = '',
    setName: string = '',
    status: string = '',
    usedAt: number = 0,
    limitAt: number = 0,
    createdAt: number = 0,
    firstName: string = '',
    lastName: string = '',
    idUser: string = '',
    profession: string = ''
  ) {
    this.idCode = idCode;
    this.idOrganization = idOrganization;
    this.email = email;
    this.idCategory = idCategory;
    this.idGroup = idGroup;
    this.setName = setName;
    this.status = status;
    this.usedAt = usedAt;
    this.limitAt = limitAt;
    this.createdAt = createdAt;
    this.firstName = firstName;
    this.lastName = lastName;
    this.idUser = idUser;
    this.profession = profession;
  }
}
