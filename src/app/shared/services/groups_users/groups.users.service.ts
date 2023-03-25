import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { BASE_URL } from "../../../../environments/environment";

@Injectable()
export class GroupsUsersService {
  public resource: string;

  constructor(private http: HttpClient) {
    this.resource = "groups_users";
  }

  get(escuela: any): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}${this.resource}?id_escuela=${escuela}`
    );
  }

  post(id_group: any): Observable<any> {
    return this.http.post<any>(`${BASE_URL}${this.resource}`, {
      id_group: id_group,
    });
  }
}
