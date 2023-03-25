import { UsersComponent } from "./users/users.component";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import "hammerjs";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { AppRoutingModule } from "./app-routing.module";
import { SharedModule } from "./shared/shared.module";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "./material.module";
import { HttpClientModule } from "@angular/common/http";
import { OrganizationsModule } from "./organizations/organizations.module";
import { CoursesModule } from "./courses/courses.module";
import { SetsModule } from "./sets/sets.module";
import { AuthModule } from "./auth/auth.module";
import { FlexLayoutModule } from "@angular/flex-layout";
import { LoadingModule } from "ngx-loading";
import { NgPipesModule } from "angular-pipes";
import { NgxPaginationModule } from "ngx-pagination";
import { DateFormat } from "./date-format";
import { MatNativeDateModule, DateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { TokenInterceptor } from "./shared/services/interceptor/interceptor";

@NgModule({
  declarations: [AppComponent, LoginComponent, UsersComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    AuthModule,
    OrganizationsModule,
    CoursesModule,
    SetsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    LoadingModule,
    NgPipesModule,
    NgxPaginationModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    FormBuilder,
    { provide: DateAdapter, useClass: DateFormat },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private dateAdapter: DateAdapter<Date>) {
    dateAdapter.setLocale("nl"); // DD/MM/YYYY
  }
}
