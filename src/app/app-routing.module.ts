import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DefaultSetsComponent } from "./default-sets/default-sets.component";
import { LoginComponent } from "./login/login.component";
import { PermisosComponent } from "./permisos/permisos.component";
import { UsersComponent } from "./users/users.component";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "permisos", component: PermisosComponent },
  { path: "users", component: UsersComponent },
  { path: "default-sets", component: DefaultSetsComponent },
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "**", redirectTo: "/login", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
