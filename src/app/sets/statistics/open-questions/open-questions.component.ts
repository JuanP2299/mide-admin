import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { QuestionService } from "../../../shared/services/question/question.service";
import { BreadcrumbService } from "../../../shared/services/breadcrumb/breadcrumb.service";
import { UserService } from "../../../shared/services/user/user.service";

@Component({
  selector: "app-open-questions",
  templateUrl: "./open-questions.component.html",
  styleUrls: ["./open-questions.component.scss"],
})
export class OpenQuestionsComponent implements OnInit {
  openQuestions = [];
  auxOpenQuestions = [];
  loading: boolean;
  idUser: string;
  idSet: string;
  user: any;

  constructor(
    private questionService: QuestionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService
  ) {
    this.breadcrumbService.setBreadCrumbNow([{ name: "Estadísticas" }]);
    this.idUser = this.route.snapshot.params.idUser;
    this.idSet = this.route.snapshot.params.idSet;
  }

  ngOnInit() {
    this.user =
      this.userService.user ||
      JSON.parse(localStorage.getItem("userStatistics"));

    this.loadOpenQuestionUserById();
  }

  loadOpenQuestionUserById() {
    this.loading = true;

    this.questionService
      .getOpenQuestionByUser(this.idSet, this.idUser)
      .subscribe((data) => {
        if (data && data.length) {
          let questions = JSON.parse(
            localStorage.getItem("question-" + this.idSet)
          );
          for (const itemQuestions of data) {
            for (const item of questions) {
              if (itemQuestions.idQuestion == item.idQuestion) {
                itemQuestions.enunciadoPregunta = item.title;
                this.openQuestions.push(itemQuestions);
              }
            }
            itemQuestions.fecha = new Date(itemQuestions.createdAt).toString();
          }
          this.openQuestions = this.openQuestions.sort(
            (a, b) => b.createdAt - a.createdAt
          );

          this.loading = false;
        }
      });
  }
}
