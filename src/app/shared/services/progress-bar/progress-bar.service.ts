import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ProgressBarService {
  // constructor() { }
  loading: number = 0;

  setLoadingValue(value: number) {
    this.loading += value;
  }
}
