export class Group {
  name: string;
  idCategory: string;
  idGroup: string;
  createdBy: string;
  createdAt: number;
  users: Array<string>;

  public static parse(item: any): Group {
    const group = new Group();
    group.name = item.name;
    group.idCategory = item.idCategory;
    group.idGroup = item.idGroup;
    group.createdBy = item.createdBy;
    group.users = item.users;
    group.createdAt = item.createdAt;
    return group;
  }

  constructor(
    name: string = "",
    idCategory: string = "",
    idGroup: string = "",
    createdBy: string = "",
    createdAt: number = 0,
    users: Array<string> = []
  ) {
    this.name = name;
    this.idCategory = idCategory;
    this.idGroup = idGroup;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.users = users;
  }
}
