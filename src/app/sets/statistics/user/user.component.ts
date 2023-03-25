import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ActionService } from "../../../shared/services/action/action.service";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { BreadcrumbService } from "../../../shared/services/breadcrumb/breadcrumb.service";
import { UserService } from "../../../shared/services/user/user.service";
import { AttemptsService } from "../../../shared/services/attemps/attempts.service";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
})
export class UserComponent implements OnInit {
  idCategory: string;
  idUser: string;
  idSet: string;
  userAttempts: any;
  setAttempts: any;
  setMode: any;
  answers: Array<any> = [];
  stats: any;
  opaqueStars: Array<any> = [2, 3, 4, 5];
  loadComplete: boolean = false;
  user: any;
  categories: Array<any> = [];
  set: any;
  lastUpdateDate: any;

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private actionService: ActionService,
    private userService: UserService,
    private authService: AuthService,
    private attemptsService: AttemptsService
  ) {
    this.breadcrumbService.setBreadCrumbNow([{ name: "Estadísticas" }]);
    this.route.parent.params.subscribe((setParams) => {
      if (setParams && setParams.idSet) {
        this.route.params.subscribe((userParams) => {
          if (userParams && userParams.idUser) {
            this.idSet = setParams.idSet;
            this.idUser = userParams.idUser;
          }
        });
      }
    });
    this.stats = { correct: 0, incorrect: 0, ratio: 0, seg: 0 };
  }

  ngOnInit() {
    this.getStats();
    this.user =
      this.userService.user ||
      JSON.parse(localStorage.getItem("userStatistics"));

    const sets: Array<any> = JSON.parse(localStorage.getItem("sets"));
    this.set = sets.find((s) => s.idCategory === this.idSet);
    this.setMode = this.set.mode || "practica";
    if (!this.set.attempts) {
      this.setAttempts = 0;
    } else {
      this.setAttempts = this.set.attempts;
    }
  }

  getStats() {
    this.actionService.getUserSetActions(this.idSet, this.idUser).subscribe(
      async (data) => {
        this.answers = data;
        await this.calculateCategoryStats();
        this.calculateLastUpdateDate();
        this.calculateGeneralStats();
        this.loadComplete = true;
      },
      (err) => {
        this.loadComplete = true;
      }
    );
  }

  calculateGeneralStats() {
    this.stats = this.calculateStats(this.answers);
    this.calculateStars();
  }

  async calculateCategoryStats() {
    for (const cat of this.set.categories) {
      const categoryAnswers = this.answers.filter(
        (a) => a.idCategory === cat.idCategory
      );
      const categoryStats = this.calculateStats(categoryAnswers);
      let userAttempts = await this.getUserAttempts(
        this.idUser,
        this.idSet,
        cat.idCategory
      );
      if (!userAttempts) {
        userAttempts = 0;
      }
      const category = {
        name: cat.name,
        correct: categoryStats.correct,
        incorrect: categoryStats.incorrect,
        seg: categoryStats.seg,
        total: categoryStats.correct + categoryStats.incorrect,
        userAttempts: userAttempts,
      };
      this.categories.push(category);
    }

    this.categories.sort((c1, c2) => c2.total - c1.total);
    return;
  }

  calculateStats(answers: Array<any>) {
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter((stat) => stat.correct).length;
    const incorrectAnswers = totalAnswers - correctAnswers;
    const ratio = (
      (correctAnswers / (totalAnswers > 0 ? totalAnswers : 1)) *
      100
    ).toFixed(0);
    let seconds: Array<number> = [];
    answers.forEach((a) => seconds.push(a.time));

    return {
      correct: correctAnswers,
      incorrect: incorrectAnswers,
      ratio: ratio,
      seg: this.calcMediana(seconds),
    };
  }

  calcMediana(items: Array<number>): number {
    let result: number = 0;
    let itemsNoEmpty = items.filter((number) => number != null);
    itemsNoEmpty.sort((a, b) => a - b);
    if (itemsNoEmpty.length > 0) {
      let middle =
        itemsNoEmpty.length > 1 ? Math.floor(itemsNoEmpty.length / 2) : 0;
      result =
        itemsNoEmpty.length % 2
          ? itemsNoEmpty[middle]
          : (itemsNoEmpty[middle] + itemsNoEmpty[middle - 1]) / 2;
    }
    return result;
  }

  calculateStars() {
    if (this.stats.ratio <= 19) {
      this.opaqueStars = [2, 3, 4, 5];
    }
    if (this.stats.ratio >= 20 && this.stats.ratio <= 39) {
      this.opaqueStars = [3, 4, 5];
    }
    if (this.stats.ratio >= 40 && this.stats.ratio <= 59) {
      this.opaqueStars = [4, 5];
    }
    if (this.stats.ratio >= 60 && this.stats.ratio <= 79) {
      this.opaqueStars = [5];
    }
    if (this.stats.ratio >= 80) {
      this.opaqueStars = [];
    }
  }

  calculateLastUpdateDate() {
    const data = this.answers;
    if (data.length) {
      const maxTime = data.sort((a, b) => b.createdAt - a.createdAt)[0]
        .createdAt;
      this.lastUpdateDate = new Date(maxTime).toString();
    }
  }

  getUserAttempts(idUser: any, idSet: any, idCategory: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.attemptsService
        .getAttempsByUser(idUser, idSet, idCategory)
        .subscribe((data) => {
          if (data.Items.length > 0) {
            resolve(data.Items[0].attempts);
          } else {
            resolve(0);
          }
          this.loadComplete = true;
        }),
        () => {
          resolve(0);
        };
    });
  }
}
