import { Component, OnInit } from "@angular/core";
import { SetService } from "../shared/services/set/set.service";

@Component({
  selector: "app-default-sets",
  templateUrl: "./default-sets.component.html",
  styleUrls: ["./default-sets.component.scss"],
})
export class DefaultSetsComponent implements OnInit {
  sets: any[];
  pagination: number = 1;
  action: string;
  loadComplete: boolean;
  search: string;
  listAux: Array<any> = [];

  constructor(private setService: SetService) {}

  ngOnInit() {
    this.loadDefaultSets();
  }

  loadDefaultSets(): void {
    this.setService.getDefaultSets().subscribe((defaultSets) => {
      this.sets = defaultSets.body;
      this.listAux = defaultSets.body;
    });
  }

  deleteSet(set: any) {
    this.setService.deleteDefaultSet(set.idCategory).subscribe((response) => {
      this.loadDefaultSets();
    });
  }

  searchFn(text: string) {
    text = text.toLowerCase();
    this.sets = this.listAux;
    this.sets = this.sets.filter((item) => {
      if (
        item.name.toLowerCase().indexOf(text) > -1 ||
        item.asignatura.toLowerCase().indexOf(text) > -1 ||
        item.createdBy.toLowerCase().indexOf(text) > -1 ||
        item.desc.toLowerCase().indexOf(text) > -1 ||
        item.course.toLowerCase().indexOf(text) > -1 ||
        item.years.toLowerCase().indexOf(text) > -1
      ) {
        return item;
      }
    });
  }

  setPagination(event: any) {
    this.pagination = event;
  }
}
