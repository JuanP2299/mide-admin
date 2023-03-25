import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { Organization } from "../../models/organization";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  public resource: string;

  constructor(private http: HttpClient) {
    this.resource = "courses";
  }

  getOrganizationCourses(idOrganization: string): Observable<any> {
    return this.http.get(
      `${BASE_URL}${this.resource}?idOrganization=${idOrganization}`
    );
  }

  create(organization: Organization): Observable<any> {
    return this.http.post<any>(`${BASE_URL}${this.resource}`, { organization });
  }
}
