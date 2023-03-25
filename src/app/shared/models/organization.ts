import { Category } from "./catogory";

export class Organization {
  name: string;
  idOrganization: string;
  sets: Array<string>;
  comuna: string;
  email: string;
  fono: string;

  public static parse(item: any): Organization {
    const organization = new Organization();
    organization.name = item.name;
    organization.idOrganization = item.idOrganization;
    organization.sets = item.sets;
    organization.comuna = item.comuna;
    organization.email = item.email;
    organization.fono = item.fono;
    return organization;
  }

  public static getOrganization(organizations: Array<Organization>, organization: Organization): Organization {
    let result: Organization = null;

    if (organizations && organizations.length > 0) {
      for (const tempOrganization of organizations) {
        if (organization.idOrganization === tempOrganization.idOrganization) {
          result = organization;
        }
      }
    }

    return result;
  }

  constructor(
    name: string = "",
    idOrganization: string = "",
    sets: Array<string> = [],
    comuna: string = "",
    email: string = "",
    fono: string = ""
  ) {
    this.name = name;
    this.idOrganization = idOrganization;
    this.sets = sets;
    this.comuna = comuna;
    this.email = email;
    this.fono = fono;
  }
}
