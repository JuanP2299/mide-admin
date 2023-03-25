import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BASE_URL } from "../../../../environments/environment";
import { Set } from "../../models/set";
import { Course } from "../../models/course";

@Injectable({
  providedIn: "root",
})
export class SetService {
  public resource: string;
  public idOrganization: string;
  public idCourse: string;

  constructor(private http: HttpClient) {
    this.resource = "sets";
  }

  getIdOrganization() {
    return this.idOrganization || localStorage.getItem("idOrganization");
  }

  getIdCourse() {
    return this.idCourse || localStorage.getItem("idCourse");
  }

  getCourses(): Course[] {
    const idOrganization = this.getIdOrganization();
    return [
      {
        name: "1º",
        idCourse: "1ero",
        idOrganization,
      },
      {
        name: "2º",
        idCourse: "2do",
        idOrganization,
      },
      {
        name: "3º",
        idCourse: "3ero",
        idOrganization,
      },
      {
        name: "4º",
        idCourse: "4to",
        idOrganization,
      },
      {
        name: "5º",
        idCourse: "5to",
        idOrganization,
      },
      {
        name: "6º",
        idCourse: "6to",
        idOrganization,
      },
      {
        name: "7º",
        idCourse: "7mo",
        idOrganization,
      },
      {
        name: "8º",
        idCourse: "8vo",
        idOrganization,
      },
      {
        name: "1M",
        idCourse: "1m",
        idOrganization,
      },
      {
        name: "2M",
        idCourse: "2m",
        idOrganization,
      },
      {
        name: "3M",
        idCourse: "3m",
        idOrganization,
      },
      {
        name: "4M",
        idCourse: "4m",
        idOrganization,
      },
      {
        name: "OTRO",
        idCourse: "otro",
        idOrganization,
      },
    ];
  }

  getByIds(idOrganization: string, idCourse: string): Observable<any> {
    return this.http.get(`${BASE_URL}${this.resource}?id_organization=${idOrganization}&id_course=${idCourse}`);
  }

  deleteSet(id_set: string, id_organization: string) {
    return this.http.request<any>("DELETE", `${BASE_URL}${this.resource}`, {
      body: {
        id_set: id_set,
        id_organization: id_organization,
      },
    });
  }

  deleteDefaultSet(idSet: string) {
    return this.http.request<any>("DELETE", `${BASE_URL}default_sets`, {
      body: {
        idSet,
      },
    });
  }

  addDefaultSet(idSet: string) {
    return this.http.post<any>(`${BASE_URL}default_sets`, { idSet: idSet });
  }

  create(set: Set): Observable<any> {
    return this.http.post<any>(`${BASE_URL}${this.resource}`, { set: set });
  }

  getDefaultSets(): Observable<any> {
    return this.http.get(`${BASE_URL}default_sets`);
  }
}
