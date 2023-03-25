import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { HttpBackend, HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class QuestionService {
  private cli;
  constructor(private http: HttpClient, private backend: HttpBackend) {
    this.cli = new HttpClient(backend);
  }

  getFile(url: string): Observable<any> {
    return this.cli.get(url);
  }

  getOpenQuestion(idSet: string): Observable<any> {
    return this.http.get<any>(`${BASE_URL}open_questions?idSet=${idSet}`);
  }

  getOpenQuestionByUser(idSet: string, idUser: string): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}open_questions/by_id?idSet=${idSet}&idUser=${idUser}`
    );
  }
}
