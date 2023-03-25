import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { User } from "../../shared/models/user";
import { AuthService } from "../../shared/services/auth/auth.service";
import { BreadcrumbService } from "../../shared/services/breadcrumb/breadcrumb.service";
import { UserService } from "../../shared/services/user/user.service";
import { QuestionService } from "../../shared/services/question/question.service";

@Component({
  selector: "app-statistics",
  templateUrl: "./statistics.component.html",
  styleUrls: ["./statistics.component.scss"],
})
export class StatisticsComponent implements OnInit {
  idCategory: string;
  selected: number;
  users: Array<User> = [];
  pagination: number = 1;
  loadComplete: boolean = false;
  search: string;
  listAux: Array<User> = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private authService: AuthService,
    private questionService: QuestionService
  ) {
    this.breadcrumbService.setBreadCrumbNow([{ name: "Estadísticas" }]);
    this.route.parent.params.subscribe((setParams) => {
      this.idCategory = setParams.idSet;
    });
  }

  ngOnInit() {
    this.loadDataUser();
  }

  loadDataUser() {
    this.userService.getUsers("", this.idCategory, 0).subscribe((data) => {
      if (data && data.length) {
        this.loadOpenQuestionUser(data);
      } else {
        this.loadComplete = true;
      }
    });
  }

  loadOpenQuestionUser(users: Array<User>) {
    this.questionService.getOpenQuestion(this.idCategory).subscribe((data) => {
      if (data && data.length) {
        for (const openQuestions of data) {
          for (const user of users) {
            if (openQuestions.idUser == user.idUser) {
              user.hasOpenQuestion = true;
            } else {
              user.hasOpenQuestion = false;
            }
          }
        }
      }
      this.users = users;
      this.listAux = users;
      this.loadComplete = true;
    });
  }

  searchFn(text: string) {
    text = text.toLowerCase();
    this.users = this.listAux;
    this.users = this.users.filter((item) => {
      if (
        item.name.toLowerCase().indexOf(text) > -1 ||
        item.email.toLowerCase().indexOf(text) > -1
      ) {
        return item;
      }
    });
  }

  setPagination(event: any) {
    this.pagination = event;
  }

  getUserStatistics(user: any) {
    this.userService.user = user;
    localStorage.setItem("userStatistics", JSON.stringify(user));
  }
}
