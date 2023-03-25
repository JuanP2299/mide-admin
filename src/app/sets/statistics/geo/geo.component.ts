import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { UserService } from "../../../shared/services/user/user.service";
import { ProgressBarService } from "../../../shared/services/progress-bar/progress-bar.service";
import { TotUser } from "../../../shared/models/tot-user";
import "rxjs/add/operator/first";
import { BreadcrumbService } from "../../../shared/services/breadcrumb/breadcrumb.service";
import { UserCognito } from "../../../shared/models/cognito-user";
import * as localForage from "localforage";

@Component({
  selector: "app-geo",
  templateUrl: "./geo.component.html",
  styleUrls: ["./geo.component.scss"],
})
export class GeoComponent implements OnInit {
  idCategory: string;
  // chartDataHealth: any;
  chartDataGeneral: any;
  chartDataActualCountry: any;
  chartDataOriginCountry: any;
  chartDataStudyCountry: any;
  // listUniversities: Array<any>;
  listProfesionals: Array<any>;
  listStudents: Array<any>;
  // dataUniversitiesXCountry: Array<any>;
  dataProXCountry: Array<any>;
  dataStudentXCountry: Array<any>;
  countrySelected: string;
  type: number;
  activeChart: number;
  day: number;
  typeChartCountry: any;
  myState: number;
  dataListTotal: Array<any>;
  totalTitle: string;
  loadComplete: boolean;
  data: Array<TotUser>;
  allUsers: Array<any>;
  totalData: Array<any>;
  pagination: number;
  firstLoad: boolean;
  from: number;
  loadChart: boolean;
  existChart: boolean;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private loadingService: ProgressBarService,
    private router: Router,
    private breadcrumbService: BreadcrumbService
  ) {
    const user: UserCognito = JSON.parse(localStorage.getItem("user"));
    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.firstLoad = true;
      this.existChart = false;
      this.from = 0;
      this.pagination = 1;
      this.allUsers = [];
      this.loadComplete = false;
      this.day = 7;
      this.activeChart = 1;
      // this.dataUniversitiesXCountry = [];
      this.dataProXCountry = [];
      this.dataStudentXCountry = [];
      // this.listUniversities = [];
      this.listProfesionals = [];
      this.listStudents = [];
      this.countrySelected = "Chile";
      this.dataListTotal = [];
      this.totalData = [];
      this.data = [];
      this.loadChart = false;
      this.typeChartCountry = [
        { value: 0, viewValue: "País actual" },
        { value: 1, viewValue: "País de estudio" },
        { value: 2, viewValue: "País de Origen" },
      ];
      this.totalTitle = "País actual";
      this.myState = 0;
      this.route.parent.parent.params.subscribe((setParams) => {
        const sets: Array<any> = JSON.parse(localStorage.getItem("sets"));
        this.idCategory = setParams.idSet;
        for (const set of sets) {
          if (set.idCategory === this.idCategory) {
            this.breadcrumbService.setBreadCrumb([
              { name: "Home", url: "/sets" },
              { name: "Conjunto -" + set.name, url: "/sets/" + set.idCategory },
              {
                name: "Estadisticas Geográficas ",
                url: "/sets/" + set.idCategory + "/statistics/geo",
              },
            ]);
            this.breadcrumbService.setBreadCrumbNow([
              { name: "Estadisticas geograficas" },
            ]);
          }
        }
        this.setLocalFrom();
      });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  loadData() {
    const dataOriginCountry: Array<Array<any>> = [["País", "Cantidad"]];
    const dataActualCountry: Array<Array<any>> = [["País", "Cantidad"]];
    const dataStudyCountry: Array<Array<any>> = [["País Estudio", "Cantidad"]];

    if (this.data && this.data.length > 0) {
      for (const item of this.data) {
        if (item.profiles.length > 0) {
          for (const pro of item.profiles) {
            // if (pro.idCategory === this.idCategory) {
            pro.actualCountry =
              pro.actualCountry === "Estados Unidos"
                ? (pro.actualCountry = "United States")
                : pro.actualCountry;
            pro.studyCountry =
              pro.studyCountry === "Estados Unidos"
                ? (pro.studyCountry = "United States")
                : pro.studyCountry;
            pro.originCountry =
              pro.originCountry === "Estados Unidos"
                ? (pro.originCountry = "United States")
                : pro.originCountry;
            /** dataOriginCountry **/
            if (pro.originCountry) {
              let exitsOriginCountry = false;
              for (const country of dataOriginCountry) {
                if (country[0] === pro.originCountry) {
                  exitsOriginCountry = true;
                  country[1]++;
                  break;
                }
              }
              if (!exitsOriginCountry) {
                dataOriginCountry.push([pro.originCountry, 1]);
              }
            }
            /**dataActualCountry**/
            if (pro.professionType !== "others") {
              const countrySet =
                pro.professionType === "profesional"
                  ? pro.actualCountry
                  : pro.studyCountry;
              let existActual = false;
              for (const country of dataActualCountry) {
                if (country[0] === countrySet) {
                  existActual = true;
                  country[1]++;
                  break;
                }
              }
              if (!existActual) {
                dataActualCountry.push([countrySet, 1]);
              }
            }
            if (pro.studyCountry) {
              let existStudent = false;
              for (const country of dataStudyCountry) {
                if (country[0] === pro.studyCountry) {
                  existStudent = true;
                  country[1]++;
                  break;
                }
              }
              if (!existStudent) {
                dataStudyCountry.push([pro.studyCountry, 1]);
              }
            }
            // }
          }
        }
      }
      this.chartDataOriginCountry = dataOriginCountry.sort((a: any, b: any) => {
        return b[1] - a[1];
      });
      this.chartDataActualCountry = dataActualCountry.sort((a: any, b: any) => {
        return b[1] - a[1];
      });
      this.chartDataStudyCountry = dataStudyCountry.sort((a: any, b: any) => {
        return b[1] - a[1];
      });
      this.selectTypeCountry({
        value: this.myState,
        viewValue: this.totalTitle,
      });
      this.existChart = true;
    } else {
      this.existChart = false;
      this.loadChart = true;
      this.loadComplete = true;
    }
  }

  updateCharts() {
    this.callInfoDate(this.day);
  }

  callInfoDate(day: number) {
    this.loadComplete = false;
    this.day = day;
    this.renderUser();
  }

  /**FUNCION DEL GRAFICO 1 SELECCIONA EL TIPO DE INFO O PAIS**/
  selectTypeCountry(option: any) {
    let chartData = [];
    this.totalData = [];
    this.myState = option.value;
    this.totalTitle = option.viewValue;
    if (this.myState === 0) {
      chartData = this.chartDataActualCountry;
    } else {
      chartData =
        this.myState === 1
          ? this.chartDataStudyCountry
          : this.chartDataOriginCountry;
    }
    let i = 0;
    const dataNew = [];
    for (const item of chartData) {
      if (i >= 1) {
        dataNew.push(item);
      }
      i++;
    }
    this.totalData = dataNew;
    this.chartDataGeneral = {
      chartType: "GeoChart",
      dataTable: chartData,
      options: {
        legend: "none",
      },
    };

    this.loadComplete = true;
    this.loadChart = true;
  }

  setFrom(day: number) {
    const today = new Date();
    const from = Date.parse(
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    );
    return day > 0 ? from - day * 24 * 60 * 60 * 1000 : 0;
  }

  /**New Functions**/
  renderUser() {
    this.loadChart = false;

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
    this.from = this.setFrom(this.day);
    this.userService
      .getUsers("", this.idCategory, this.from)
      .subscribe((data) => {
        if (data && data.values.length > 0) {
          this.data = data.values;
          this.loadData();
        } else {
          this.loadComplete = true;
          this.data = [];
          this.totalData = [];
          this.loadChart = true;
        }
      });
  }

  setLocalFrom() {
    const fromLocal = JSON.parse(localStorage.getItem("fromStatistics"));
    if (fromLocal && this.firstLoad) {
      this.day = fromLocal.lastFrom;
      this.firstLoad = false;
      localForage
        .getItem("users")
        .then((value: Array<any>) => {
          this.data = value;
          this.loadData();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      localStorage.setItem(
        "fromStatistics",
        JSON.stringify({ lastFrom: this.day })
      );
      this.from = this.setFrom(this.day);
      this.renderUser();
    }
  }

  setPagination(event) {
    this.pagination = event;
  }

  ngOnInit() {}
}
