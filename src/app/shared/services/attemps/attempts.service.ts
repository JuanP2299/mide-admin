import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_URL } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AttemptsService {
  public resource: string;
  constructor(private http: HttpClient) {
    this.resource = "user_attempts";
  }

  getAttempsByUser(idUser: any, idSet: any, idCategory: any) {
    return this.http.get<any>(
      `${BASE_URL}${this.resource}?id_user=${idUser}&id_set=${idSet}&id_category=${idCategory}`
    );
  }
}
