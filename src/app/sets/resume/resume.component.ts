import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { ChangeService } from "../../shared/services/change/change.service";
import { SetService } from "../../shared/services/set/set.service";
import { Set } from "../../shared/models/set";
import { AuthService } from "../../shared/services/auth/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Change } from "../../shared/models/change";
import { BreadcrumbService } from "../../shared/services/breadcrumb/breadcrumb.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UtilsService } from "../../shared/services/utils/utils.service";
import { Question } from "../../shared/models/question";
import { DialogServiceService } from "../../shared/services/dialog-service/dialog-service.service";
import { UserCognito } from "../../shared/models/cognito-user";

@Component({
  selector: "app-resume",
  templateUrl: "./resume.component.html",
  styleUrls: ["./resume.component.scss"],
})
export class ResumeComponent implements OnInit {
  loading: boolean;
  resumesCategory: Array<any>;
  resumesQuestion: Array<any>;
  set: Set;
  questions: Array<Question>;
  changes: Array<Change>;
  setChange: Change;
  now: number;
  active: boolean;
  categoryOff: Array<any>;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private changeService: ChangeService,
    private breadcrumbService: BreadcrumbService,
    private snackBar: MatSnackBar,
    private router: Router,
    private setService: SetService,
    private dialog: DialogServiceService
  ) {
    const user: UserCognito = JSON.parse(localStorage.getItem("user"));
    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.resumesCategory = [];
      this.resumesQuestion = [];
      this.categoryOff = [];
      this.now = new Date().getTime();
      this.active = false;
      this.loading = false;

      this.route.parent.params.subscribe((params) => {
        const sets: Array<Set> = JSON.parse(localStorage.getItem("sets"));
        if (sets && sets.length > 0) {
          for (const set of sets) {
            if (set.idCategory === params.idSet) {
              this.set = set;
              this.questions = JSON.parse(
                localStorage.getItem("question-" + this.set.idCategory)
              );
              this.changes = JSON.parse(
                localStorage.getItem("changes-" + this.set.idCategory)
              );
              this.setChange = this.changes.find((change) =>
                /^set-\d+$/.test(change.type)
              );
              this.getResumes();
              this.checkDraft();
              this.breadcrumbService.setBreadCrumb([
                { name: "Home", url: "/sets" },
                {
                  name: "Conjunto - " + this.set.name,
                  url: "/sets/" + this.set.idCategory,
                },
              ]);
              this.breadcrumbService.setBreadCrumbNow([
                { name: "Administrar conjunto" },
              ]);
              break;
            }
          }
        }
      });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  ngOnInit() {}

  getResumes() {
    const resumesQuestion = [];
    const resumesCategory = [];
    for (const change of this.changes) {
      if (/^question(\w|\W)*$/.test(change.type)) {
        resumesQuestion.push({
          item:
            this.questions && this.questions.length > 0
              ? this.questions.find(
                  (searchQuestion) =>
                    searchQuestion.idQuestion === change.question.idQuestion
                )
              : null,
          change,
        });
      } else if (/^category(\w|\W)*$/.test(change.type)) {
        resumesCategory.push({
          item:
            this.set.categories && this.set.categories.length > 0
              ? this.set.categories.find(
                  (searchCategory) =>
                    searchCategory.idCategory === change.category.idCategory
                )
              : null,
          change,
        });
      }
    }

    this.resumesQuestion = resumesQuestion;
    this.resumesCategory = resumesCategory;
  }

  checkDraft() {
    this.loading = true;

    this.changeService
      .get(
        this.setService.getIdOrganization(),
        this.set.idCategory,
        this.set.updatedAt
      )
      .subscribe(
        (data) => {
          if (data && data.values) {
            localStorage.setItem(
              "changes-" + this.set.idCategory,
              JSON.stringify(data.values)
            );
            this.changes = data.values;
            this.checkCategoryAns(this.changes);
            this.setChange = this.changes.find((change) =>
              /^set-\d+$/.test(change.type)
            );
            this.getResumes();
          }
          this.loading = false;
        },
        () => {},
        () => {
          this.loading = false;
        }
      );
  }

  publish() {
    if (this.setChange && this.setChange.use) {
      if (
        this.setChange.use.inUse &&
        this.setChange.use.user.idUser === localStorage.getItem("user.idUser")
      ) {
        this.publishData();
      } else {
        if (this.now - this.setChange.use.at > 60 * 6 * 1000) {
          this.publishData();
        } else {
          this.snackBar.open(
            "Otro usuario está editando este conjunto.",
            "Cerrar",
            { duration: 3000 }
          );
        }
      }
    } else {
      this.snackBar.open(
        "Otro usuario está editando este conjunto.",
        "Cerrar",
        { duration: 3000 }
      );
    }
  }

  publishData() {
    this.loading = true;

    this.changeService
      .publish(this.setService.getIdOrganization(), this.set.idCategory)
      .subscribe(
        (data) => {
          if (data.msg) {
            localStorage.removeItem("question-" + this.set.idCategory);
            localStorage.removeItem("sets");
            this.snackBar.open(data.msg, "Cerrar", { duration: 3000 });
            this.router.navigate(["sets"]);
          } else {
            this.snackBar.open(data.err, "Cerrar", { duration: 3000 });
          }
        },
        () => {},
        () => {
          this.loading = false;
        }
      );
  }

  toHumanDate(timestamp): string {
    return UtilsService.toHumanDate(timestamp);
  }

  checkCategoryAns(data: any) {
    let exits = false;
    for (let i = 0; i < data.length; i++) {
      if (/^category(\w|\W)*$/.test(data[i].type)) {
        if (
          data[i] &&
          data[i].category &&
          data[i].category.questions &&
          data[i].category.questions.length === 0
        ) {
          this.categoryOff.push(data[i].category.name);
          exits = true;
        }
      }
    }
    if (exits) {
      this.active = true;
    }
  }

  discart() {
    this.dialog
      .confirmationChangesDialog(this.setChange.idSet, this.setChange.createdAt)
      .subscribe((res) => {
        if (res) {
          this.router.navigate(["sets", this.set.idCategory]);
        }
      });
  }
}
