import { first } from "rxjs/operators";
import { Component } from "@angular/core";
import { UserService } from "../../shared/services/user/user.service";
import { AuthService } from "../../shared/services/auth/auth.service";
import { User } from "../../shared/models/user";
import { OrganizationService } from "../../shared/services/organization/organization.service";
import { SetService } from "../../shared/services/set/set.service";
import { Organization } from "../../shared/models/organization";
import { Router } from "@angular/router";
import "rxjs/add/operator/first";
import { ProgressBarService } from "../../shared/services/progress-bar/progress-bar.service";
import { BreadcrumbService } from "../../shared/services/breadcrumb/breadcrumb.service";
import { UtilsService } from "../../shared/services/utils/utils.service";
import * as uuid from "uuid/v4";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-list-organizations",
  templateUrl: "./list-organizations.component.html",
  styleUrls: ["./list-organizations.component.scss"],
})
export class ListOrganizationsComponent {
  organizations: Array<Organization>;
  filterOrganizations: Array<Organization>;
  idOrganization: string;
  createOrganization: Organization;
  organizationForm: FormGroup;
  loading: boolean;
  showActive: boolean;
  isAdmin: string;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private organizationService: OrganizationService,
    private loadingService: ProgressBarService,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private utils: UtilsService,
    private router: Router,
    private setService: SetService,
    private snackBar: MatSnackBar
  ) {
    this.showActive = false;
    this.organizations = [];
    const user: any = JSON.parse(localStorage.getItem("user"));
    this.isAdmin = user.isAdmin.toString();
    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.loading = true;
      this.breadcrumbService.setBreadCrumb([
        { name: "Organizations", url: "/set" },
      ]);

      this.organizations = JSON.parse(localStorage.getItem("organizations"));
      this.filterOrganizations = localStorage.getItem("organizations")
        ? JSON.parse(localStorage.getItem("organizations"))
        : [];
      this.getUser();
      this.initForm();
    } else {
      this.router.navigate(["/login"]);
    }
  }

  initForm() {
    this.organizationForm = this.formBuilder.group({
      name: ["", Validators.required],
      comuna: ["", Validators.required],
      email: ["", Validators.required],
      phone: ["", Validators.required],
    });
  }

  getUser() {
    this.showActive = false;

    const idUser = localStorage.getItem("user.idUser");
    if (idUser && idUser !== "") {
      this.userService.getAdmin(idUser).subscribe((data) => {
        if (data && data.values && data.values.length > 0) {
          const user = new User(
            data.values[0].name,
            data.values[0].lastname,
            data.values[0].email,
            data.values[0].idUser,
            data.values[0].sets,
            data.values[0].role,
            data.values[0].isAdmin,
            data.values[0].idOrganizations
          );
          localStorage.setItem("user", JSON.stringify(user));
          this.authService.setUser(user);
          this.organizationService.getByUser(user.idUser).subscribe(
            (organizations) => {
              if (organizations && organizations.length > 0) {
                let auxOrganizations = [];
                for (const organization of organizations) {
                  const organizationParsed = Organization.parse(organization);
                  auxOrganizations.push(organizationParsed);
                }
                auxOrganizations = auxOrganizations.sort(function (a, b) {
                  if (a.name < b.name) return -1;
                  if (a.name > b.name) return 1;
                  return 0;
                });

                this.organizations = auxOrganizations;
                this.filterOrganizations = auxOrganizations;
                localStorage.setItem(
                  "organizations",
                  JSON.stringify(this.organizations)
                );
              } else {
                this.showActive = true;
              }

              this.loading = false;
            },
            (error) => {
              this.loading = false;
            }
          );
        } else {
          this.loading = false;
        }
      });
    }
  }

  search(term: string) {
    if (term !== "") {
      this.organizations = this.filterOrganizations.filter(
        (item) =>
          this.utils
            .removeDiacritics(item.name)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) >
            -1 ||
          this.utils
            .removeDiacritics(item.comuna)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) >
            -1 ||
          this.utils
            .removeDiacritics(item.email)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) >
            -1 ||
          this.utils
            .removeDiacritics(item.fono)
            .trim()
            .toLowerCase()
            .indexOf(this.utils.removeDiacritics(term.trim().toLowerCase())) >
            -1
      );
    } else {
      this.organizations = this.filterOrganizations;
    }
  }

  add() {
    this.createOrganization = new Organization();
    this.createOrganization.idOrganization = uuid();
    this.initForm();
  }

  cancelAdd() {
    this.createOrganization = null;
  }

  save() {
    if (this.organizationForm.valid) {
      this.loading = true;
      this.createOrganization.name = this.organizationForm.get("name").value;
      this.createOrganization.comuna =
        this.organizationForm.get("comuna").value;
      this.createOrganization.email = this.organizationForm.get("email").value;
      this.createOrganization.fono = this.organizationForm.get("phone").value;
      this.saveData(this.createOrganization);
    }
  }

  saveData(organization: Organization) {
    this.organizationService.create(organization).subscribe(
      (resp) => {
        if (resp) {
          this.snackBar.open("Escuela creada correctamente", "Cerrar", {
            duration: 3000,
          });
        } else {
          this.snackBar.open("Error: inténtelo nuevamente", "Cerrar", {
            duration: 3000,
          });
        }
      },
      () => {
        this.snackBar.open("Error: inténtelo nuevamente", "Cerrar", {
          duration: 3000,
        });
      },
      () => {
        this.createOrganization = null;
        this.getUser();
      }
    );
  }

  viewOrganization(organization: any) {
    this.setService.idOrganization = organization.idOrganization;
    localStorage.setItem("idOrganization", organization.idOrganization);
    this.router.navigate(["organizations", organization.idOrganization]);
  }
}
