import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { Organization } from "../../models/organization";
import { HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class OrganizationService {
  public resource: string;

  constructor(private http: HttpClient) {
    this.resource = "organizations";
  }

  getByUser(idUser: string): Observable<any> {
    return this.http.get<any>(`${BASE_URL}${this.resource}?id_user=${idUser}`);
  }

  create(organization: Organization): Observable<any> {
    return this.http.post<any>(`${BASE_URL}${this.resource}`, { organization });
  }

  modifyOrganizationUsers(
    idOrganization: string,
    idUser: string,
    action: string
  ): Observable<any> {
    return this.http.put<any>(`${BASE_URL}${this.resource}/modify_users`, {
      idOrganization: idOrganization,
      id_user: idUser,
      action: action,
    });
  }
}
