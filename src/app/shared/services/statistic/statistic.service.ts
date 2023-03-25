import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  public resource: string;

  constructor(private client: HttpClient) {
    this.resource = "statistics";
  }

  get(
    chart: string,
    idOrganization: string,
    idCategory: string,
    from: number = 0,
    idQuestion?: string
  ): Observable<any> {
    return this.client.get(
      `${BASE_URL}${this.resource}?chart_type=${chart}&id_set=${idCategory}&idOrganization=${idOrganization}&from=${from}` +
        (idQuestion && idQuestion !== "" ? `&idQuestion=${idQuestion}` : "")
    );
  }
}
