import { Component, OnInit } from "@angular/core";
import { Organization } from "../shared/models/organization";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ProgressBarService } from "../shared/services/progress-bar/progress-bar.service";
import { BreadcrumbService } from "../shared/services/breadcrumb/breadcrumb.service";

@Component({
  selector: "app-courses",
  templateUrl: "./courses.component.html",
  styleUrls: ["./courses.component.scss"],
})
export class CoursesComponent implements OnInit {
  organization: Organization;
  active: number;
  nameOrganization: string;
  title: Array<any>;
  loadComplete: boolean;

  constructor(
    private route: ActivatedRoute,
    private loadingService: ProgressBarService,
    private breadCrumbService: BreadcrumbService,
    private router: Router
  ) {
    this.router.events.subscribe((value: any) => {
      if (value.url) {
        if (value.url.lastIndexOf("organizations/") > -1) {
          this.active = 1;
        }
        if (value.url.lastIndexOf("groups-actions") > -1) {
          this.active = 2;
        }
        if (
          value.url.lastIndexOf("general") > -1 ||
          value.url.lastIndexOf("geo") > -1 ||
          value.url.lastIndexOf("details") > -1
        ) {
          this.active = 3;
        }
      }
    });

    this.breadCrumbService.breadcrumbNow$.subscribe(
      (value) => (this.title = value)
    );
    this.active = 1;

    this.route.params.subscribe((params) => {
      const organizations: Array<Organization> = JSON.parse(
        localStorage.getItem("organizations")
      );
      if (organizations && organizations.length > 0) {
        for (const organization of organizations) {
          if (organization.idOrganization === params["idOrganization"]) {
            this.organization = organization;
            this.nameOrganization = organization.name;
            break;
          }
        }
      }
    });
  }

  select(option: number) {
    this.active = option;
  }

  ngOnInit() {
    if (!JSON.parse(localStorage.getItem("login"))) {
      this.router.navigate(["/login"]);
    }
  }
}
