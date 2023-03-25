import { first } from "rxjs/operators";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { TotUser } from "../../../shared/models/tot-user";
import { StatisticService } from "../../../shared/services/statistic/statistic.service";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { UserService } from "../../../shared/services/user/user.service";
import { SetService } from "../../../shared/services/set/set.service";
import { ProgressBarService } from "../../../shared/services/progress-bar/progress-bar.service";
import { BreadcrumbService } from "../../../shared/services/breadcrumb/breadcrumb.service";
import { Question } from "../../../shared/models/question";
import "rxjs/add/operator/first";
import { ModalQuestionService } from "../../../shared/services/dialog-service/modal-question.service";
import { UtilsService } from "../../../shared/services/utils/utils.service";
import { UserCognito } from "../../../shared/models/cognito-user";
import * as localForage from "localforage";

@Component({
  selector: "app-general",
  templateUrl: "./general.component.html",
  styleUrls: ["./general.component.scss"],
})
export class GeneralComponent implements OnInit, OnDestroy {
  pieChartData: any;
  userChartData: any;
  userCantChartData: any;
  activitiesData: any;
  arrayUsers: Array<TotUser>;
  idCategory: string;
  nroChart: number;
  topComments: Array<any>;
  topLikeComments: Array<any>;
  topAnsTrue: Array<any>;
  topAnsFalse: Array<any>;
  topMoreAns: Array<any>;
  arrayModals: Array<any>;
  day: number;
  typeInfo: number;
  loadComplete: boolean;
  chartActShow: boolean;
  chartLineUserShow: boolean;
  filters: any;
  filterUsers: Array<TotUser>;
  users: Array<TotUser>;
  firstLoad: boolean;
  from: number;
  types: Array<any>;
  studyCountries: Array<any>;
  universities: Array<any>;
  professions: Array<any>;
  years: Array<any>;
  aux: Array<any>;
  lastKey: any;
  perfiledUsers: number;
  showChartCupons: boolean;
  pagination: any;
  loadTableCorrect: boolean;
  loadTableIncorrect: boolean;
  loadTableComent: boolean;
  loadTableFavorite: boolean;
  loadChartLineUser: boolean;
  loadChartCupons: boolean;
  reload: boolean;

  constructor(
    private statisticService: StatisticService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private loadingService: ProgressBarService,
    private breadcrumbService: BreadcrumbService,
    private modal: ModalQuestionService,
    private router: Router,
    private setService: SetService
  ) {
    const user: UserCognito = JSON.parse(localStorage.getItem("user"));
    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.reload = false;
      this.pagination = {
        countries: 0,
        universtities: 0,
        professions: 0,
        years: 0,
        quantity: 3,
      };
      this.lastKey = { active: false };
      this.perfiledUsers = 0;
      this.firstLoad = true;
      this.from = 0;
      this.filterUsers = [];
      this.users = [];
      this.typeInfo = 1;
      this.arrayModals = [];
      this.topComments = [];
      this.topLikeComments = [];
      this.topAnsTrue = [];
      this.topAnsFalse = [];
      this.topMoreAns = [];
      this.nroChart = 0;
      this.day = 7;
      this.loadComplete = false;
      this.chartActShow = false;
      this.chartLineUserShow = false;
      this.resetFilters();
      this.aux = [];

      this.showChartCupons = false;
      this.loadTableCorrect = false;
      this.loadTableIncorrect = false;
      this.loadTableComent = false;
      this.loadTableFavorite = false;
      this.loadChartLineUser = false;
      this.loadChartCupons = false;
      this.route.parent.parent.params.subscribe((setParams) => {
        const sets: Array<any> = JSON.parse(localStorage.getItem("sets"));
        this.idCategory = setParams.idSet;
        for (const set of sets) {
          if (set.idCategory === this.idCategory) {
            this.breadcrumbService.setBreadCrumb([
              { name: "Home", url: "/sets" },
              {
                name: "Conjunto - " + set.name,
                url: "/sets/" + set.idCategory,
              },
              {
                name: "Estadisticas Generales",
                url: "/sets/" + set.idCategory + "/statistics",
              },
            ]);
            this.breadcrumbService.setBreadCrumbNow([
              { name: "Estadisticas generales" },
            ]);
          }
        }
        this.setLocalFrom();
      });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  resetFilters() {
    this.filters = {
      type: "",
      studyCountry: "",
      originCountry: "",
      diffCountry: false,
      university: "",
      profession: "",
      year: "",
    };
  }

  updateCharts() {
    this.loadComplete = false;

    this.nroChart = 1;

    this.loadChartLineUser = false;
    this.chartActShow = false;
    this.chartLineUserShow = true;
    this.showChartCupons = false;
    this.reload = true;
    this.setLocalFrom();
  }

  selectDays(day: number) {
    if (day !== this.day) {
      this.reload = true;
      localStorage.setItem("fromStatistics", JSON.stringify({ lastFrom: day }));
      this.loadComplete = false;
      this.day = day;
      this.setLocalFrom();
    }
  }

  countTypes() {
    const types = [];

    for (const user of this.users) {
      if (user.profiles && user.profiles.length > 0) {
        const index = types.findIndex((a) => a.name === user.professionType);
        if (index >= 0) {
          types[index].count++;
        } else {
          types.push({ name: user.professionType, count: 1 });
        }

        this.perfiledUsers++;
      }
    }

    this.types = types;
    this.applyFilter();
  }

  selectType(type) {
    this.resetFilters();
    this.filters.type = type.name;
    this.filters.studyCountry = "";
    this.filters.university = "";
    this.filters.profession = "";
    this.filters.year = "";
    this.applyFilter();
  }

  selectStudyCountry(studyCountry) {
    this.filters.studyCountry = studyCountry.name;
    this.filters.university = "";
    this.filters.profession = "";
    this.filters.year = "";
    this.applyFilter();
  }

  selectUniversity(university) {
    this.filters.university = university.name;
    this.filters.profession = "";
    this.filters.year = "";
    this.applyFilter();
  }

  selectProfession(profession) {
    this.filters.profession = profession.name;
    this.filters.year = "";
    this.applyFilter();
  }

  selectYear(year) {
    this.filters.year = year.name;
    this.applyFilter();
  }

  applyFilter() {
    let users = [];

    if (this.filters.type !== "") {
      users = this.filterTypes(this.users);
    } else {
      for (const user of this.users) {
        if (user.profiles && user.profiles.length > 0) {
          users.push(Object.assign(user));
        }
      }
    }

    if (this.filters.studyCountry !== "") {
      users = this.filterStudyCountries(users);
    }

    if (this.filters.university !== "") {
      users = this.filterUniversities(users);
    }

    if (this.filters.profession !== "") {
      users = this.filterProfessions(users);
    }

    if (this.filters.year !== "") {
      users = this.filterYears(users);
    }

    this.filterUsers = users;
  }

  filterTypes(originalUsers: Array<TotUser>): Array<TotUser> {
    const users = [];
    const studyCountries = [];

    for (const user of originalUsers) {
      if (user.professionType === this.filters.type) {
        users.push(Object.assign(user));
        if (user.profiles && user.profiles.length > 0) {
          if (user.professionType !== "others") {
            const index = studyCountries.findIndex(
              (a) => a.name === user.profiles[0].studyCountry
            );

            if (index >= 0) {
              studyCountries[index].count++;
            } else {
              studyCountries.push({
                name: user.profiles[0].studyCountry,
                count: 1,
              });
            }
          }
        }
      }
    }

    studyCountries.sort((a, b) => b.count - a.count);
    this.studyCountries = studyCountries;

    return users;
  }

  filterStudyCountries(originalUsers: Array<TotUser>): Array<TotUser> {
    const users = [];
    const universities = [];

    for (const user of originalUsers) {
      if (
        user.profiles &&
        user.profiles.length > 0 &&
        user.profiles[0].studyCountry === this.filters.studyCountry
      ) {
        users.push(Object.assign(user));
        const index = universities.findIndex(
          (a) => a.name === user.profiles[0].university
        );
        if (index >= 0) {
          universities[index].count++;
        } else {
          universities.push({ name: user.profiles[0].university, count: 1 });
        }
      }
    }

    universities.sort((a, b) => b.count - a.count);
    this.universities = universities;

    return users;
  }

  filterUniversities(originalUsers: Array<TotUser>): Array<TotUser> {
    const users = [];
    const professions = [];

    for (const user of originalUsers) {
      if (
        user.profiles &&
        user.profiles.length > 0 &&
        user.profiles[0].university === this.filters.university
      ) {
        users.push(Object.assign(user));
        const index = professions.findIndex(
          (a) => a.name === user.profiles[0].profession
        );
        if (index >= 0) {
          professions[index].count++;
        } else {
          professions.push({ name: user.profiles[0].profession, count: 1 });
        }
      }
    }

    professions.sort((a, b) => b.count - a.count);
    this.professions = professions;

    return users;
  }

  filterProfessions(originalUsers: Array<TotUser>): Array<TotUser> {
    const users = [];
    const years = [];

    for (const user of originalUsers) {
      if (
        user.profiles &&
        user.profiles.length > 0 &&
        user.profiles[0].profession === this.filters.profession
      ) {
        users.push(Object.assign(user));
        const index = years.findIndex(
          (a) => a.name === user.profiles[0].outUniversity
        );
        if (index >= 0) {
          years[index].count++;
        } else {
          years.push({ name: user.profiles[0].outUniversity, count: 1 });
        }
      }
    }

    years.sort((a, b) => b.count - a.count);
    this.years = years;

    return users;
  }

  filterYears(originalUsers: Array<TotUser>): Array<TotUser> {
    const users = [];

    for (const user of originalUsers) {
      if (
        user.profiles &&
        user.profiles.length > 0 &&
        user.profiles[0].outUniversity === this.filters.year
      ) {
        users.push(Object.assign(user));
      }
    }

    return users;
  }

  /*************************************************************/
  /**Functions Call tables--charts**/
  loadDataUser() {
    let fromLocal: any;
    localForage.getItem("users").then((value) => {
      fromLocal = value;
    });
    this.reload = this.reload ? this.reload : this.checkTimeLoad();
    if ((!fromLocal && this.firstLoad) || this.reload) {
      this.loadChartLineUser = false;

      this.userService
        .getUsers("", this.idCategory, this.from)
        .subscribe((data) => {
          if (data && data.values) {
            if (data.values.length > 0) {
              this.users = data.values;
              localStorage.setItem(
                "last-timeStamp-users" + this.idCategory,
                JSON.stringify(new Date().getTime())
              );
              localForage.setItem("users", data.values).then(() => {
                this.renderUserInfo(data.values);
                this.countTypes();
                this.firstLoad = false;
                this.reload = false;
              });
            } else {
              this.loadChartLineUser = true;
              this.chartLineUserShow = false;
            }
          } else {
            this.loadChartLineUser = true;
            this.chartLineUserShow = false;
          }
          // CHECK
          this.loadComplete = true;
        });
    } else {
      localForage.getItem("users").then((value: Array<any>) => {
        this.users = value;
        this.renderUserInfo(value);
        this.countTypes();
      });
    }
  }

  renderUserCupons() {
    this.loadChartCupons = false;
    this.statisticService
      .get(
        "infoCupons",
        this.setService.getIdOrganization(),
        this.idCategory,
        this.from
      )
      .subscribe((resp) => {
        if (
          resp &&
          resp.values &&
          (resp.values.used !== 0 || resp.values.notUsed !== 0)
        ) {
          const dataTable = [
            ["Informacion Cupones", "Usados"],
            ["Usados", resp.values.used],
            ["No usados", resp.values.notUsed],
          ];
          this.pieChartData = {
            chartType: "PieChart",
            dataTable: dataTable,
            options: {
              legend: "right",
              width: "100%",
              height: 330,
              "animation.startup": "true",
              backgroundColor: "transparent",
              "legend.textStyle": { fontSize: 16 },
              pointSIze: 20,
              chartArea: { width: "94%", height: "98%", top: 30 },
            },
          };
          this.showChartCupons = true;
          this.loadChartCupons = true;
        } else {
          this.showChartCupons = false;
          this.loadChartCupons = true;
        }
      });
  }

  getMessages() {
    this.topComments = [];
    this.loadTableComent = false;

    setTimeout(() => {
      this.statisticService
        .get(
          "messages",
          this.setService.getIdOrganization(),
          this.idCategory,
          this.from
        )
        .subscribe((data) => {
          if (data && data.values && data.values.length > 0) {
            this.renderTableMsg(data.values);
          }
          this.loadTableComent = true;
        });
    }, 1000);
  }

  renderTableMsg(data: any) {
    const aux = [];
    for (const info of data) {
      let exits = false;
      for (const item of aux) {
        if (item.idQuestion === info.idQuestion) {
          exits = true;
          item.count++;
          break;
        }
      }
      if (!exits) {
        aux.push({
          idQuestion: info.idQuestion,
          count: 1,
        });
      }
    }
    aux.sort((a, b) => {
      return b.count - a.count;
    });
    const infoTable = [];
    for (let i = 0; i < 10; i++) {
      if (aux && aux[i]) {
        infoTable.push({
          number: this.getInfoQuestion(aux[i].idQuestion),
          count: aux[i].count,
          idQuestion: aux[i].idQuestion,
        });
      }
    }
    this.topComments = infoTable;
  }

  /**SET FROM CHECK**/
  setLocalFrom() {
    const fromLocal = JSON.parse(localStorage.getItem("fromStatistics"));
    if (fromLocal) {
      this.day = fromLocal.lastFrom;
    } else {
      localStorage.setItem(
        "fromStatistics",
        JSON.stringify({ lastFrom: this.day })
      );
    }
    this.from = this.setFrom(this.day);

    this.loadDataUser();
    this.getMessages();
    this.renderActivities();

    this.mostCorrectAnswer();
    this.mostIncorrectAnswer();
    this.favAnswer();
  }

  // LocalDate //
  toLocalDate(day: number) {
    const value = new Date(day);
    value.setHours(value.getHours() + value.getTimezoneOffset() / 60);
    return value;
  }

  renderActivities() {
    this.statisticService
      .get(
        "activity",
        this.setService.getIdOrganization(),
        this.idCategory,
        this.from
      )
      .subscribe((data) => {
        if (data && data.values.length > 0) {
          this.renderChartActivities(data.values);
        } else {
          this.chartActShow = false;
        }
      });
    this.renderUserCupons();
  }

  mostCorrectAnswer() {
    this.loadTableCorrect = false;
    this.topAnsTrue = [];

    setTimeout(() => {
      this.statisticService
        .get(
          "mostCorrectAnswer",
          this.setService.getIdOrganization(),
          this.idCategory,
          this.from
        )
        .subscribe((data) => {
          if (data.values && data.values.length > 0) {
            for (let i = 0; i < 10; i++) {
              if (data.values[i]) {
                this.topAnsTrue.push({
                  number: this.getInfoQuestion(data.values[i].idQuestion),
                  count: data.values[i].count,
                  idQuestion: data.values[i].idQuestion,
                });
              } else {
                break;
              }
            }
          }
          this.loadTableCorrect = true;
        });
    }, 1000);
  }

  mostIncorrectAnswer() {
    this.topAnsFalse = [];
    this.loadTableIncorrect = false;

    setTimeout(() => {
      this.statisticService
        .get(
          "mostIncorrectAnswer",
          this.setService.getIdOrganization(),
          this.idCategory,
          this.from
        )
        .subscribe((data) => {
          if (data && data.values && data.values.length > 0) {
            for (let i = 0; i < 10; i++) {
              if (data.values[i]) {
                this.topAnsFalse.push({
                  number: this.getInfoQuestion(data.values[i].idQuestion),
                  count: data.values[i].count,
                  idQuestion: data.values[i].idQuestion,
                });
              } else {
                break;
              }
            }
          }
          this.loadTableIncorrect = true;
        });
    }, 1000);
  }

  favAnswer() {
    this.topLikeComments = [];
    this.loadTableFavorite = false;

    setTimeout(() => {
      this.statisticService
        .get("favAnswer", this.setService.getIdOrganization(), this.idCategory)
        .subscribe((data) => {
          if (data && data.values && data.values.length > 0) {
            for (let i = 0; i < 10; i++) {
              if (data.values[i]) {
                this.topLikeComments.push({
                  number: this.getInfoQuestion(data.values[i].idQuestion),
                  count: data.values[i].count,
                  idQuestion: data.values[i].idQuestion,
                });
              } else {
                break;
              }
            }
          }
          this.loadTableFavorite = true;
        });
    }, 1000);
  }

  /**Grafico de Linea Respuestas Tendencia**/
  renderChartActivities(data: any) {
    this.activitiesData = [];
    const dataTable = [["Día", "Total", "Correctas", "Incorrectas"]];
    for (const day of data) {
      const timesFormat = this.toLocalDate(day.createDayAt);
      const datestring =
        timesFormat.getDate() +
        "-" +
        (timesFormat.getMonth() + 1) +
        "-" +
        +timesFormat.getFullYear();
      dataTable.push([
        datestring,
        day.correct + day.incorrect,
        day.correct,
        day.incorrect,
      ]);
    }
    this.activitiesData = {
      chartType: "LineChart",
      dataTable: dataTable,
      options: {
        legend: "top",
        chartArea: { width: "98%", left: 100, right: 50 },
        hAxis: {
          title: "Días",
        },
        vAxis: {
          title: "Respuestas",
          gridlines: { count: dataTable.length - 1 + 1 },
          viewWindow: {
            min: 0,
          },
        },
        width: "100%",
        height: 300,
        series: {
          0: { color: "#4d0026" },
          1: { color: "blue" },
          2: { color: "red" },
        },
        // curveType: 'function'
      },
    };
    this.chartActShow = true;
  }

  changeInfo(type: number) {
    this.typeInfo = type;
  }

  showQuestion(sendQuestion: any): void {
    this.modal
      .ModalService(
        "Estadistica detallada",
        "delete",
        sendQuestion.idQuestion,
        this.idCategory,
        this.setFrom(this.day)
      )
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  /**Grafico de Linea Usuarios **/
  renderUserInfo(data) {
    const dataLine: Array<Array<any>> = [["Dia", "Cantidad"]];
    this.arrayUsers = data;
    let students = 0;
    let pro = 0;
    let others = 0;

    for (const user of data) {
      if (user.professionType === "student") {
        students++;
      } else if (user.professionType === "profesional") {
        pro++;
      } else if (user.professionType === "others") {
        others++;
      }

      let exits;
      const timesFormat = this.toLocalDate(user.createdAt);
      const datestring =
        timesFormat.getDate() +
        "-" +
        (timesFormat.getMonth() + 1) +
        "-" +
        +timesFormat.getFullYear();
      for (const itemData of dataLine) {
        if (itemData[0] === datestring) {
          exits = true;
          itemData[1]++;
          break;
        }
      }
      if (!exits) {
        dataLine.push([datestring, 1]);
      }
    }
    this.userChartData = {
      chartType: "PieChart",
      dataTable: [
        ["Informacion tipo usuario", "Profesionales/Estudiantes"],
        ["Profesionales", pro],
        ["Estudiantes", students],
        ["Otros", others],
      ],
      options: {
        legend: "right",
        width: "100%",
        height: 330,
        "animation.startup": "true",
        backgroundColor: "transparent",
        "legend.textStyle": { fontSize: 16 },
        pointSIze: 20,
        // 'chartArea': {left: 0, top: 30, bottom: 30, right: 0, width: '100%', height: '94%'}
        chartArea: { width: "94%", height: "98%", top: 30 },
      },
    };
    this.userCantChartData = {
      chartType: "LineChart",
      dataTable: dataLine,
      options: {
        legend: "top",
        chartArea: { width: "98%", left: 100, right: 50 },
        hAxis: {
          title: "Días",
        },
        vAxis: {
          title: "Usuarios",
          // gridlines: {count: (dataLine.length - 1) + 1},
          // viewWindowMode: 'explicit',
          viewWindow: {
            min: 0,
            // max: 'auto'
          },
        },
        width: "100%",
        height: 300,
      },
    };
    this.chartLineUserShow = true;
    this.loadChartLineUser = true;
    this.loadComplete = true;
  }

  getInfoQuestion(idQuestion: string) {
    let resp: Question;
    const questions = JSON.parse(
      localStorage.getItem("question-" + this.idCategory)
    );
    if (questions && questions.length > 0) {
      for (const item of questions) {
        if (item.idQuestion === idQuestion) {
          resp = item.number;
          this.arrayModals.push(item);
          break;
        }
      }
    }
    return resp;
  }

  setPagination(type, event) {
    switch (type) {
      case "countries":
        this.pagination.countries = event;
        break;
      case "universities":
        this.pagination.universtities = event;
        break;
      case "professions":
        this.pagination.professions = event;
        break;
      case "years":
        this.pagination.years = event;
        break;
    }
  }

  setFrom(day: number) {
    const today = new Date();
    const from = Date.parse(
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    );
    return day > 0 ? from - day * 24 * 60 * 60 * 1000 : 0;
  }

  ngOnInit() {}

  ngOnDestroy() {}

  checkTimeLoad() {
    const difference =
      new Date().getTime() -
      JSON.parse(
        localStorage.getItem("last-timeStamp-users" + this.idCategory)
      );
    // const difference = 1515639600000 - (JSON.parse(localStorage.getItem('last-timeStamp-users' + this.idCategory)));
    const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
    return daysDifference > 0;
  }
}
