import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  public resource: string;

  constructor(private http: HttpClient) {
    this.resource = "teachers";
  }

  update(id_user: string, action: string): Observable<any> {
    return this.http.put<any>(`${BASE_URL}${this.resource}`, {
      id_user: id_user,
      action: action,
    });
  }
}
