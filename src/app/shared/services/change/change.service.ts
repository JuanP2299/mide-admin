import { Inject, Injectable } from "@angular/core";
import { Change } from "../../models/change";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class ChangeService {
  public resource: string;

  constructor(private http: HttpClient) {
    this.resource = "changes";
  }

  post(change: Change): Observable<any> {
    return this.http.post<any>(`${BASE_URL}${this.resource}`, {
      change: change,
    });
  }

  get(idOrganization: string, idSet: string, from: number): Observable<any> {
    return this.http.get(
      `${BASE_URL}${this.resource}?id_set=${idSet}&created_at=${from}&idOrganization=${idOrganization}`
    );
  }

  publish(idOrganization: string, idSet: string) {
    return this.http.get<any>(
      `${BASE_URL}${
        this.resource
      }?id_set=${idSet}&idOrganization=${idOrganization}&publish=${true}`
    );
  }

  delete(
    idOrganization: string,
    idSet: string,
    type: string,
    createdAt: number = 0
  ) {
    const params = { idOrganization, idSet, type, from: createdAt };
    if (type === "") {
      delete params.type;
    }
    return this.http.request<any>("DELETE", `${BASE_URL}${this.resource}`, {
      body: params,
    });
  }
}
