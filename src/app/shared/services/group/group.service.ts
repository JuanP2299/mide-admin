import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class GroupService {
  public resource: string;

  constructor(private http: HttpClient) {
    this.resource = "groups";
  }

  get(idSet: string, idOrganization: string, idGroup: string = ""): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}${this.resource}?id_set=${idSet}&id_organization=${idOrganization}` +
        (idGroup !== "" ? `&id_group=${idGroup}` : "")
    );
  }

  genCode(code: any): Observable<any> {
    return this.http.post<any>(`${BASE_URL}codes`, { code: code });
  }

  newGroup(group: any): Observable<any> {
    return this.http.post<any>(`${BASE_URL}groups`, { group: group });
  }

  updateGroup(group: any) {
    return this.http.put<any>(`${BASE_URL}groups`, { group: group });
  }
}
