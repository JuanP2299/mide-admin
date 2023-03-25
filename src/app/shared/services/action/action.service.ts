import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ActionService {
  public resource: string;

  constructor(private http: HttpClient) {
    this.resource = "actions";
  }

  getByQuestion(idQuestion: string, from: number): Observable<any> {
    return this.http.get<any>(`${BASE_URL}${this.resource}?id_question=${idQuestion}&type=answer&created_at=${from}`);
  }

  getActionByTime(idCategory: string, from: number): Observable<any> {
    return this.http.get<any>(`${BASE_URL}${this.resource}?id_set=${idCategory}&crated_at=${from}`);
  }

  getUserSetActions(idSet: string, idUser: string) {
    return this.http.get<any>(`${BASE_URL}${this.resource}?id_set=${idSet}&user_id=${idUser}&type=answer`);
  }
}
