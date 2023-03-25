import { first, distinctUntilChanged, debounceTime } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BreadcrumbService } from "../../../shared/services/breadcrumb/breadcrumb.service";
import { Category } from "../../../shared/models/catogory";
import { Set } from "../../../shared/models/set";
import { Question } from "../../../shared/models/question";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { Action } from "../../../shared/models/action";
import { ProgressBarService } from "../../../shared/services/progress-bar/progress-bar.service";
import { StatisticService } from "../../../shared/services/statistic/statistic.service";
import { DiscussionService } from "../../../shared/services/discussion/discussion.service";
import { TotUser } from "../../../shared/models/tot-user";
import { UserService } from "../../../shared/services/user/user.service";
import { SetService } from "../../../shared/services/set/set.service";
import { Subject } from "rxjs";
import { UtilsService } from "../../../shared/services/utils/utils.service";
import { UserCognito } from "../../../shared/models/cognito-user";
import { Router } from "@angular/router";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"],
})
export class DetailsComponent implements OnInit {
  set: Set;
  items: Array<any>;
  routes: Array<any>;
  questions: Array<Question>;
  question: Question;
  actions: Array<Action>;
  homeRoute: any;
  distChartD: any;
  timeChartD: any;
  day: number;
  pagination: number;
  searchCat: boolean;
  categories: Array<any>;
  searchTerm: string;
  searchInput: Subject<string>;
  messages: Array<any>;
  auxUsers: Array<TotUser>;
  loadCompleted: boolean;
  maxCont: boolean;
  from: number;
  firstLoad: boolean;

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private authService: AuthService,
    private progressBarService: ProgressBarService,
    private statisticService: StatisticService,
    private discussionService: DiscussionService,
    private utils: UtilsService,
    private userService: UserService,
    private setService: SetService,
    private router: Router
  ) {
    const user: UserCognito = JSON.parse(localStorage.getItem("user"));
    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.searchInput = new Subject<string>();
      this.from = 0;
      this.firstLoad = true;
      this.maxCont = false;
      this.searchCat = true;
      this.pagination = 1;
      this.loadCompleted = true;
      this.messages = [];
      this.day = 7;
      this.items = [];
      this.routes = [];
      this.questions = [];
      this.categories = [];
      this.route.parent.parent.params.subscribe((setParams) => {
        const sets: Array<Set> = JSON.parse(localStorage.getItem("sets"));
        for (const set of sets) {
          if (set.idCategory === setParams.idSet) {
            this.set = set;
            for (const category of set.categories) {
              const auxCat = Category.parse(category);
              this.items.push(auxCat);
              this.categories.push(auxCat);
            }
            this.sortItems();
            this.homeRoute = {
              selected: this.set,
              name: this.set.name,
              id: this.set.idCategory,
              items: this.items,
            };
            this.breadcrumbService.setBreadCrumb([
              { name: "Home", url: "/sets" },
              {
                name: "Conjunto - " + set.name,
                url: "/sets/" + set.idCategory,
              },
              {
                name: "Estadisticas detalladas",
                url: "/sets/" + set.idCategory + "/categories/details",
              },
            ]);
            this.breadcrumbService.setBreadCrumbNow([
              { name: "Estadisticas por pregunta" },
            ]);
            break;
          }
        }
        const questions = JSON.parse(
          localStorage.getItem("question-" + setParams.idSet)
        );
        if (questions && questions.length > 0) {
          for (const question of questions) {
            this.questions.push(Question.parse(question));
          }
        }
      });
      this.searchInput
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((term) => {
          this.search(term);
        });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  sortItems() {
    this.items.sort((a, b) => {
      let status = 0;
      if (a instanceof Category && b instanceof Category) {
        status = a.name.localeCompare(b.name);
      } else if (a instanceof Question && b instanceof Question) {
        status = a.number - b.number;
      }
      return status;
    });
  }

  select(item: Category | Question, refresh: boolean = false) {
    if (item instanceof Category) {
      if (item.categories.length === 0) {
        if (this.questions && this.questions.length > 0) {
          const catQuestions = [];
          for (const idQuestion of item.questions) {
            for (const question of this.questions) {
              if (idQuestion === question.idQuestion) {
                catQuestions.push(question);
                break;
              }
            }
          }
          this.items = catQuestions;
          this.sortItems();
          this.routes.push({
            selected: item,
            name: item.name,
            id: item.idCategory,
            items: this.items,
          });
        }
      }
    } else if (item instanceof Question) {
      this.question = item;
      if (!refresh) {
        this.routes.push({
          selected: item,
          name: item.number,
          id: item.idQuestion,
          items: [],
        });
      }
      this.loadData();
    }
  }

  /*initCharts() {
    if (this.question && this.actions) {
      this.initDistChart();
      this.initTimeChart();
    }
  }*/

  initDistChart() {
    const dataTable = [["Alternativas", "Cantidad"]];

    const alternatives: Array<any> = [];
    let cont = 65;
    for (const alternative of this.question.alternatives) {
      alternatives.push({
        alternative: alternative,
        quantity: 0,
        letter: String.fromCharCode(cont),
      });
      cont++;
    }

    for (const action of this.actions) {
      for (const alternative of alternatives) {
        if (action.idAlternative === alternative.alternative.idAlternative) {
          alternative.quantity++;
          break;
        }
      }
    }

    for (const alternative of alternatives) {
      dataTable.push([alternative.letter, alternative.quantity]);
    }

    this.distChartD = {
      chartType: "ColumnChart",
      dataTable: dataTable,
      options: {
        title: "Alternativas seleccionadas por respuesta",
        colors: ["green"],
        width: "100%",
        height: 330,
        backgroundColor: "transparent",
        legend: { position: "none" },
        vAxis: {
          title: "Veces seleccionada",
          viewWindow: {
            min: 0,
          },
        },
        hAxis: {
          title: "Alternativa",
        },
        options: {
          chartArea: { width: "94%", height: "98%", top: 30 },
        },
      },
    };
  }

  initTimeChart() {
    const dataMax = 0;
    const dataTable = [["Respueta", "Segundos"]];

    const times = [];
    let i = 1;
    for (const action of this.actions) {
      if (
        this.question.idQuestion === action.idQuestion &&
        action.type === "answer" &&
        action.time &&
        action.time <= 100
      ) {
        times.push(["Respuestas", action.time]);
        i++;
      } else {
        this.maxCont = true;
        times.push(["Respuestas", 101]);
      }
    }
    if (this.maxCont) {
      times.push(["Respuestas", dataMax]);
    }
    times.sort((a, b) => b[1] - a[1]);
    for (const item of times) {
      dataTable.push(item);
    }
    this.timeChartD = {
      chartType: "Histogram",
      dataTable: dataTable,
      options: {
        title: "Cantidad de respuestas por segundo",
        colors: ["green"],
        backgroundColor: "transparent",
        legend: { position: "none" },
        histogram: { bucketSize: 5 },
        width: "100%",
        height: 330,
        bar: { gap: 0 },
        vAxes: {
          0: { title: "Respuestas" },
          viewWindow: {
            min: 0,
          },
        },
        hAxes: {
          0: { title: "Tiempo en responder (Segundos)" },
          viewWindow: {
            min: 0,
            max: 100,
          },
        },
        options: {
          chartArea: { width: "94%", height: "98%", top: 30 },
        },
      },
    };
  }

  navigate(routeItem: any, home: boolean = false) {
    const routes = [];
    this.items = routeItem.items;

    for (const route of this.routes) {
      if (!home) {
        routes.push(route);
      }
      if (route.id === routeItem.id) {
        break;
      }
    }

    this.routes = routes;
  }

  selectDays(day: number) {
    this.day = day;
    this.select(this.routes[this.routes.length - 1].selected, true);
  }

  verify(item: any, type: string) {
    return type === "category"
      ? item instanceof Category
      : item instanceof Question;
  }

  /**Load data**/
  loadData() {
    this.loadCompleted = false;
    this.messages = [];

    const fromLocal = JSON.parse(localStorage.getItem("fromStatistics"));
    if (fromLocal && this.firstLoad) {
      this.day = fromLocal.lastFrom;
      this.firstLoad = false;
    } else {
      localStorage.setItem(
        "fromStatistics",
        JSON.stringify({ lastFrom: this.day })
      );
    }
    this.from = this.setDate(this.day);
    this.statisticService
      .get(
        "detailQuestion",
        this.setService.getIdOrganization(),
        this.set.idCategory,
        this.from,
        this.question.idQuestion
      )
      .subscribe((data) => {
        if (data && data.values && data.values.length > 0) {
          this.loadCompleted = true;
          this.actions = data.values;
          this.initTimeChart();
          this.initDistChart();
          this.getDiscussions();
        } else {
          this.loadCompleted = true;
        }
        // this.getDiscussions();
      });
  }

  /**Discussions**/
  getDiscussions() {
    this.discussionService
      .get(this.set.idCategory, this.question.idQuestion)
      .subscribe((data) => {
        if (data && data.values.length > 0) {
          this.setUsersInfo(data.values);
        } else {
          this.loadCompleted = true;
        }
      });
  }

  setUsersInfo(data: any) {
    const array = [];
    for (const msg of data) {
      let exits = false;
      if (array.length > 0) {
        for (const item of array) {
          if (item === msg.idUser) {
            exits = true;
            break;
          }
        }
      }
      if (!exits) {
        array.push(msg.idUser);
      }
    }

    const dataArray = array.join(",");
    this.userService.getArrayUsers(dataArray).subscribe((dataUsers) => {
      if (dataUsers && dataUsers.values.length > 0) {
        this.auxUsers = dataUsers.values;
        for (const msg of data) {
          const timesFormat = this.toLocalDate(msg.idMessage);
          const datestring =
            timesFormat.getDate() +
            "-" +
            (timesFormat.getMonth() + 1) +
            "-" +
            +timesFormat.getFullYear() +
            " " +
            timesFormat.toLocaleTimeString();
          const user = this.getUser(msg.idUser);
          this.messages.push({
            name: user.name,
            text: msg.text,
            image: user.image ? user.image : "assets/images/no-avatar.png",
            createdAt: datestring,
            like: msg.likeCount,
            status: msg.delete === true ? "Eliminado" : "",
          });
        }
        this.loadCompleted = true;
      } else {
        this.loadCompleted = true;
      }
    });
  }

  getUser(userId: string): TotUser {
    let exist = false;
    let userData: TotUser;
    for (const item of this.auxUsers) {
      if (item.idUser === userId) {
        exist = true;
        userData = item;
        break;
      }
    }
    return userData;
  }

  toLocalDate(day: number) {
    const value = new Date(day);
    value.setHours(value.getHours() + value.getTimezoneOffset() / 60);
    return value;
  }

  setPagination(event) {
    this.pagination = event;
  }

  setSearchType(active: boolean) {
    this.searchCat = active;
    this.search(this.searchTerm);
  }

  search(term: string) {
    const items = this.searchCat
      ? this.categories
      : this.routes.length > 0
      ? Question.getByCategory(
          this.routes[this.routes.length - 1].selected.questions,
          this.questions
        )
      : this.questions;
    if (items && items.length > 0 && term && term.length > 0) {
      term = term.trim();
      const search = this.utils.removeDiacritics(term.toLowerCase());
      this.items = items.filter((item) => {
        return this.searchCat
          ? this.utils
              .removeDiacritics(item.name)
              .trim()
              .toLowerCase()
              .indexOf(search) > -1
          : this.utils
              .removeDiacritics(item.title)
              .trim()
              .toLowerCase()
              .indexOf(search) > -1 || item.number === parseInt(search, 10);
      });
    } else {
      this.items = this.searchCat
        ? this.categories
        : this.routes.length > 0
        ? Question.getByCategory(
            this.routes[this.routes.length - 1].selected.questions,
            this.questions
          )
        : this.questions;
    }
    this.sortItems();
  }

  setDate(day: number) {
    const now = new Date();
    const today = Date.parse(
      now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate()
    );
    return day > 0 ? today - day * 24 * 60 * 60 * 1000 : 0;
  }

  ngOnInit() {}
}
