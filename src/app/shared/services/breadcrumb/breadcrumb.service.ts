import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {

  breadcrumb: Array<any>=null;
  private breadcrumbSource = new BehaviorSubject<Array<any>>(this.breadcrumb);
  breadcrumb$ = this.breadcrumbSource;

  breadcrumbNow: Array<any> =null;
  private breadcrumbNowSource = new BehaviorSubject<Array<any>>(this.breadcrumbNow);
  breadcrumbNow$ = this.breadcrumbNowSource;

  setBreadCrumb(rute: Array<any>) {
    this.updateSbj(rute);
  }

  private updateSbj(value) {
    this.breadcrumbSource.next(value);
  }

  setBreadCrumbNow(rute: Array<any>) {
    this.updateNowSbj(rute);
  }

  private updateNowSbj(value) {
    this.breadcrumbNowSource.next(value);
  }
}
