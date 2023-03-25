import { first } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "../../../../shared/services/auth/auth.service";
import { Action } from "../../../../shared/models/action";
import { StatisticService } from "../../../../shared/services/statistic/statistic.service";
import { DiscussionService } from "../../../../shared/services/discussion/discussion.service";
import { TotUser } from "../../../../shared/models/tot-user";
import { UserService } from "../../../../shared/services/user/user.service";
import { SetService } from "../../../../shared/services/set/set.service";

@Component({
  selector: "app-modal-statistics",
  templateUrl: "./modal-statistics.component.html",
  styleUrls: ["./modal-statistics.component.scss"],
})
export class ModalStatisticsComponent implements OnInit {
  title: string;
  message: string;
  active: boolean;
  idQuestion: string;
  idCategory: string;
  distChart: any;
  timeChart: any;
  actions: Array<Action>;
  alternatives: any;
  from: number;
  question: any;
  messages: Array<any>;
  users: Array<TotUser>;
  auxUsers: Array<TotUser>;
  arrayIdUsers: Array<number>;
  p: number;
  loadMsgCompleted: boolean;
  maxCont: boolean;

  constructor(
    public dialogRef: MatDialogRef<ModalStatisticsComponent>,
    private setService: SetService,
    private authService: AuthService,
    private statisticService: StatisticService,
    private discussionService: DiscussionService,
    private userService: UserService
  ) {
    this.active = true;
    this.maxCont = false;
    this.messages = [];
    this.arrayIdUsers = [];
    this.auxUsers = [];
    this.p = 1;
    this.loadMsgCompleted = false;
  }

  initDistChart() {
    let maxY = 0;
    let dataTable = [["Alternativa", "Veces Selecionada"]];
    const alternatives: Array<any> = [];
    let cont = 65;
    for (const alternative of this.alternatives) {
      alternatives.push({
        alternative: alternative.idAlternative,
        quantity: 0,
        letter: String.fromCharCode(cont),
      });
      cont++;
    }
    for (const action of this.actions) {
      if (action.createdAt > this.from) {
        if (
          action.type === "answer" &&
          action.idAlternative &&
          action.idQuestion === this.question.idQuestion
        ) {
          for (const alternative of alternatives) {
            if (action.idAlternative === alternative.alternative) {
              alternative.quantity++;
              break;
            }
          }
        }
      }
    }
    let alternativesData = 0;
    for (const alternative of alternatives) {
      maxY = alternative.quantity > maxY ? alternative.quantity : maxY;
      if (alternative.quantity === 0) {
        alternativesData++;
      }
      dataTable.push([alternative.letter, alternative.quantity]);
    }
    if (alternativesData === alternatives.length) {
      dataTable = [];
    }

    this.distChart = {
      chartType: "ColumnChart",
      dataTable: dataTable,
      options: {
        title: "Alternativas seleccionadas por respuesta",
        colors: ["green"],
        backgroundColor: "transparent",
        legend: { position: "none" },
        chartArea: { width: "98%", left: 100, right: 50 },
        width: "100%",
        height: 300,
        vAxis: {
          title: "Veces seleccionada",
          viewWindow: {
            min: 0,
          },
        },
        hAxis: {
          title: "Alternativa",
        },
      },
    };
  }

  initTimeChart() {
    const maxX = 0;
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
        // = action.time > maxX ? action.time : maxX;
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
    this.timeChart = {
      chartType: "Histogram",
      dataTable: dataTable,
      options: {
        title: "Cantidad de respuestas por segundo",
        colors: ["green"],
        backgroundColor: "transparent",
        histogram: { bucketSize: 5 },
        legend: { position: "none" },
        chartArea: { width: "98%", left: 100, right: 50 },
        width: "100%",
        //width: 550,
        height: 300,
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
      },
    };
    this.active = false;
  }

  loadData() {
    this.maxCont = false;

    this.statisticService
      .get(
        "detailQuestion",
        this.setService.getIdOrganization(),
        this.idCategory,
        this.from,
        this.idQuestion
      )
      .subscribe((data) => {
        if (data) {
          this.getDiscussions();
          this.actions = data.values;
          this.alternatives = this.question.alternatives;
          this.initTimeChart();
          this.initDistChart();
          this.active = false;
        }
      });
  }

  getDiscussions() {
    this.discussionService
      .get(this.idCategory, this.idQuestion)
      .subscribe((data) => {
        if (data && data.values.length > 0) {
          this.setUsersInfo(data.values);
        } else {
          this.loadMsgCompleted = true;
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
        this.loadMsgCompleted = true;
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

  ngOnInit() {
    this.dialogRef.updateSize("80%", "80%");
    this.active = true;
    const questions = JSON.parse(
      localStorage.getItem("question-" + this.idCategory)
    );
    // this.users = JSON.parse(localStorage.getItem('users-' + this.idCategory));
    for (const item of questions) {
      if (item.idQuestion === this.idQuestion) {
        this.question = item;
        break;
      }
    }
    this.loadData();
  }
}
