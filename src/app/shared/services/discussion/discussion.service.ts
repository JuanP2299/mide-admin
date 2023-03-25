import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class DiscussionService {
  public resource: string;

  constructor(private client: HttpClient) {
    this.resource = "messages";
  }

  get(idCategory, idQuestion: string): Observable<any> {
    return this.client.get<any>(
      `${BASE_URL}${this.resource}?id_set=${idCategory}&id_question=${idQuestion}&admin=true`
    );
  }
}
