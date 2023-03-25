import { Component } from "@angular/core";
import { SetService } from "../../shared/services/set/set.service";
import { Organization } from "../../shared/models/organization";
import { Router } from "@angular/router";
import "rxjs/add/operator/first";
import { BreadcrumbService } from "../../shared/services/breadcrumb/breadcrumb.service";
import { UtilsService } from "../../shared/services/utils/utils.service";
import { Course } from "../../shared/models/course";
import { DialogServiceService } from "../../shared/services/dialog-service/dialog-service.service";

@Component({
  selector: "app-list-courses",
  templateUrl: "./list-courses.component.html",
  styleUrls: ["./list-courses.component.scss"],
})
export class ListCoursesComponent {
  courses: Array<Course>;
  organizationName: string = "";
  filterCourses: Array<Course>;
  idOrganization: string;
  idCourse: string;
  isAdmin: string;
  loading: boolean;
  loadComplete: boolean;
  showActive: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private utils: UtilsService,
    private router: Router,
    private setService: SetService,
    private dialog: DialogServiceService
  ) {
    this.showActive = false;
    this.courses = [];
    const user: any = JSON.parse(localStorage.getItem("user"));
    this.isAdmin = user.isAdmin.toString();

    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.loading = true;
      this.breadcrumbService.setBreadCrumb([{ name: "Courses", url: "/set" }]);
      this.courses = JSON.parse(localStorage.getItem("courses"));
      this.filterCourses = localStorage.getItem("courses") ? JSON.parse(localStorage.getItem("courses")) : [];
      this.idOrganization = this.setService.getIdOrganization();
      this.getCourses();
      this.setOrganizationName();
    } else {
      this.router.navigate(["/login"]);
    }
  }

  onChangePermisos() {
    this.openAsociarUsuariosEscuelaDialog(this.idOrganization);
  }

  openAsociarUsuariosEscuelaDialog(idOrganization: any) {
    this.dialog.asociarPermisosEscuelaUsuarios("Confirm Dialog", idOrganization).subscribe(async (res) => {
      if (res.reload) {
        this.loadComplete = false;
        //this.loadDataUser();
      }
    });
  }

  getCourses() {
    this.showActive = false;
    const idUser = localStorage.getItem("user.idUser");
    if (idUser && idUser !== "") {
      const courses = this.setService.getCourses();
      if (courses && courses.length) {
        let auxCourses = [];
        for (const course of courses) {
          const courseParsed = Course.parse(course);
          auxCourses.push(courseParsed);
        }

        this.courses = auxCourses;
        this.filterCourses = auxCourses;
        localStorage.setItem("courses", JSON.stringify(courses));
      }
    } else {
      this.showActive = true;
    }
    this.loading = false;
  }

  search(term: string) {
    if (term !== "") {
      this.courses = this.filterCourses.filter(
        (item) =>
          this.utils
            .removeDiacritics(item.name)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) > -1 ||
          this.utils
            .removeDiacritics(item.idCourse)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) > -1
      );
    } else {
      this.courses = this.filterCourses;
    }
  }

  viewCourse(idCourse: string) {
    this.setService.idCourse = idCourse;
    localStorage.setItem("idCourse", idCourse);
    this.router.navigate(["organizations", this.idOrganization, idCourse]);
  }

  setOrganizationName() {
    try {
      const organizations: [Organization] = JSON.parse(localStorage.getItem("organizations"));
      if (organizations && organizations.length) {
        this.organizationName = organizations.find((o) => o.idOrganization == this.idOrganization).name;
      }
    } catch (error) {
      this.organizationName = "";
    }
  }

  goToOrganizations() {
    this.router.navigate(["organizations"]);
  }
}
