import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class UserService {
  resource: string;
  user: any;

  constructor(private http: HttpClient) {
    this.resource = "users";
  }

  getAdmin(idUser: string): Observable<any> {
    return this.http.get(`${BASE_URL}admins?id_admin=${idUser}`);
  }

  changeAdmin(idUser: string, action: string): Observable<any> {
    return this.http.put<any>(`${BASE_URL}admins`, { id_user: idUser, action });
  }

  getAll(): Observable<any> {
    return this.http.get(`${BASE_URL}admins/get_all`);
  }

  getUsers(array: string, idSet: string, from: number): Observable<any> {
    return this.http.get(
      `${BASE_URL}${this.resource}?id_set=${idSet}&createdAt=${from}` +
        (array.length > 0 ? `&arrayUser=${array}` : "")
    );
  }

  getArrayUsers(array: string): Observable<any> {
    return this.http.get(`${BASE_URL}${this.resource}?arrayUser=${array}`);
  }
}
