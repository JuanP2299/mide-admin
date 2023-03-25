import { Component, OnDestroy, OnInit } from "@angular/core";
import { Set } from "../shared/models/set";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ProgressBarService } from "../shared/services/progress-bar/progress-bar.service";
import { BreadcrumbService } from "../shared/services/breadcrumb/breadcrumb.service";
import { DialogServiceService } from "../shared/services/dialog-service/dialog-service.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-sets",
  templateUrl: "./sets.component.html",
  styleUrls: ["./sets.component.scss"],
})
export class SetsComponent implements OnInit, OnDestroy {
  set: Set;
  active: number;
  nameSet: string;
  title: Array<any>;
  loadComplete: boolean;

  constructor(
    private route: ActivatedRoute,
    private breadCrumbService: BreadcrumbService,
    private router: Router,
    private dialog: DialogServiceService,
    private snackBar: MatSnackBar
  ) {
    this.router.events.subscribe((value: any) => {
      if (value.url) {
        if (value.url.lastIndexOf("sets/") > -1) {
          this.active = 1;
        }
        if (value.url.lastIndexOf("groups-actions") > -1) {
          this.active = 2;
        }
        if (
          value.url.lastIndexOf("statistics") > -1 ||
          value.url.lastIndexOf("geo") > -1 ||
          value.url.lastIndexOf("details") > -1 ||
          value.url.lastIndexOf("user") > -1
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
      const sets: Array<Set> = JSON.parse(localStorage.getItem("sets"));
      if (sets && sets.length > 0) {
        for (const set of sets) {
          if (set.idCategory === params["idSet"]) {
            this.set = set;
            this.nameSet = set.name;
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
    /*const array = this.breadCrumbService.breadcrumb$.value;
    if ((array[array.length - 1].name).lastIndexOf('Conjunto') > -1) {
      this.active = 1;
    }
    if ((array[array.length - 1].name).lastIndexOf('Administrar Usuarios') > -1
      || (array[array.length - 1].name).lastIndexOf('Cupon') > -1) {
      this.active = 2;
    }
    if ((array[array.length - 1].name).lastIndexOf('Estadistica') > -1) {
      this.active = 3;
    }*/
  }

  openModalFileSetUploadDialog(idCategory: any) {
    this.dialog
      .setUploadFile("Confirm Dialog", idCategory)
      .subscribe(async (res) => {
        if (res.reload) {
          this.loadComplete = false;
          if (res.file) {
            this.loadComplete = true;
            this.snackBar.open("Archivo subido correctamente.", "Cerrar", {
              duration: 3000,
            });
          } else {
            this.snackBar.open("Error al cargar el archivo.", "Cerrar", {
              duration: 3000,
            });
          }

          this.loadComplete = true;
        }
      });
  }

  ngOnDestroy() {}
}
