import { AfterViewInit, Component, OnInit } from "@angular/core";
import { AwsService } from "./shared/services/aws/aws.service";
import { AuthService } from "./shared/services/auth/auth.service";
import { Router } from "@angular/router";
import { ProgressBarService } from "./shared/services/progress-bar/progress-bar.service";
import { BreadcrumbService } from "./shared/services/breadcrumb/breadcrumb.service";
import { UserCognito } from "./shared/models/cognito-user";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  user: any;
  route: Array<any>;
  login: boolean;

  constructor(
    private awsService: AwsService,
    private authService: AuthService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    public loadingService: ProgressBarService
  ) {
    this.route = [];
    this.breadcrumbService.breadcrumb$.subscribe((value) => (this.route = value));
    this.awsService.initAwsService();
    this.authService.user.subscribe((user) => {
      this.user = user;
    });
    if (!this.authService.checkStatus()) {
      this.logOut();
    }
  }
  goToAddUser() {
    this.router.navigate(["/users"]);
  }

  goToPermisos() {
    this.router.navigate(["/permisos"]);
  }

  goToDefaultSets() {
    this.router.navigate(["/default-sets"]);
  }

  goToHome() {
    this.router.navigate([""]);
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  ngOnInit() {
    const user: UserCognito = JSON.parse(localStorage.getItem("user"));
    if (!JSON.parse(localStorage.getItem("login")) || !user) {
      this.router.navigate(["/login"]);
    }
  }
}
