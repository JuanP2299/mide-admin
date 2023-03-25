import { first, distinctUntilChanged, debounceTime } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import * as uuid from "uuid/v4";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import { Set } from "../../shared/models/set";
import { Question } from "../../shared/models/question";
import { BreadcrumbService } from "../../shared/services/breadcrumb/breadcrumb.service";
import { Category } from "../../shared/models/catogory";
import { AuthService } from "../../shared/services/auth/auth.service";
import { Action } from "../../shared/models/action";
import { UtilsService } from "../../shared/services/utils/utils.service";
import { ChangeService } from "../../shared/services/change/change.service";
import { Change } from "../../shared/models/change";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AwsService } from "../../shared/services/aws/aws.service";
import { QuestionService } from "../../shared/services/question/question.service";
import { DialogServiceService } from "../../shared/services/dialog-service/dialog-service.service";
import { SetService } from "../../shared/services/set/set.service";
import { Alternative } from "../../shared/models/alternative";
import { UserCognito } from "../../shared/models/cognito-user";

@Component({
  selector: "app-view-sets",
  templateUrl: "./view-sets.component.html",
  styleUrls: ["./view-sets.component.scss"],
})
export class ViewSetsComponent implements OnInit {
  set: Set;
  setShow: Set;
  items: any[];
  categories: any[];
  questionTypes: any[] = [
    { name: "Alternativa", idQuestionType: "Alternativa" },
    { name: "V o F", idQuestionType: "VerdaderoOFalso" },
    { name: "Abierta", idQuestionType: "Abierta" },
  ];
  setMode: any;
  routes: any[];
  questions: Question[];
  question: Question;
  actions: Action[];
  homeRoute: any;
  pagination: number;
  searchInput: Subject<string>;
  searchCat: boolean;
  searchTerm: string;
  editCat: boolean;
  editCategory: boolean;
  setForm: FormGroup;
  changes: Change[];
  setChange: Change;
  now: number;
  loading: boolean;
  active: number;
  day: number;
  loadComplete: boolean;
  questionsLastUpdate: number;
  createCategory: Category;
  categoryForm: FormGroup;
  questionForm: FormGroup;
  createQuestion: Question;
  activeButtonPublish: boolean;
  listQuestions: Question[];
  showDetailQuestion: boolean;
  selectedCategory: String;
  loadQuestions = false;
  editorContent: string = "My Document's Title";
  setVideo: string;
  setUrl: string;
  defaultButtonText: string;
  isDefaultSet: boolean;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private authService: AuthService,
    private utils: UtilsService,
    private formBuilder: FormBuilder,
    private changeService: ChangeService,
    private snackBar: MatSnackBar,
    private awsService: AwsService,
    private questionService: QuestionService,
    private dialog: DialogServiceService,
    private setService: SetService,
    private router: Router
  ) {
    const user: UserCognito = JSON.parse(localStorage.getItem("user"));
    if (JSON.parse(localStorage.getItem("login")) && user) {
      this.user = user;
      this.loadQuestions = false;
      this.activeButtonPublish = false;
      this.loadComplete = false;
      this.questionsLastUpdate = 0;
      this.day = 7;
      this.active = 1;
      this.items = [];
      this.categories = [];
      this.routes = [];
      this.questions = [];
      this.listQuestions = [];
      this.changes = [];
      this.searchInput = new Subject<string>();
      this.searchCat = true;
      this.now = new Date().getTime();
      this.pagination = 1;
      this.loading = false;
      this.showDetailQuestion = false;
      this.selectedCategory = "";

      this.initCategoryForm();
      this.initQuestionForm();
      this.route.parent.params.subscribe((params) => {
        const sets: Array<Set> = JSON.parse(localStorage.getItem("sets"));
        if (sets && sets.length > 0) {
          for (const set of sets) {
            if (set.idCategory === params["idSet"]) {
              this.set = set;
              for (const category of set.categories) {
                const auxCat = Category.parse(category);
                this.items.push(auxCat);
                this.categories.push(auxCat);
              }
              this.sortItems();
              this.checkDraft();
              this.breadcrumbService.setBreadCrumb([
                { name: "Home", url: "/sets" },
                {
                  name: "Conjunto - " + this.set.name,
                  url: "/sets/" + this.set.idCategory,
                },
              ]);
              this.breadcrumbService.setBreadCrumbNow([{ name: "Administrar conjunto" }]);
              this.setQuestions();
              break;
            }
          }
        }

        if (this.set.type === "production") {
          const lastUpdate = JSON.parse(localStorage.getItem("lastUpdateQuestion-" + this.set.idCategory));
          if (!lastUpdate || this.set.updatedAt > lastUpdate[0].updatedAt) {
            this.loadQuestions = true;
            this.syncQuestions();
          }
        }
      });

      this.searchInput.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
        this.search(term);
      });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  hasVideo() {
    return this.setVideo != "";
  }
  hasUrl() {
    return this.setUrl != "";
  }
  getUrl() {
    return this.setUrl;
  }
  getVideoUrl() {
    return "https://www.youtube.com/watch?v=" + this.setVideo;
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  setQuestions() {
    this.questions = [];
    this.listQuestions = [];
    const questions = JSON.parse(localStorage.getItem("question-" + this.set.idCategory));
    if (questions && questions.length > 0) {
      for (const question of questions) {
        this.questions.push(Question.parse(question));
        this.listQuestions.push(Question.parse(question));
      }
    }
  }

  setCategories() {
    this.categories = [];
    for (const category of this.set.categories) {
      this.categories.push(Category.parse(category));
    }
  }

  initForm() {
    if (this.setChange && !this.setChange.set) {
      this.setChange.set = this.set;
    }

    this.setForm = this.formBuilder.group({
      name: [this.setChange.set.name, Validators.required],
      desc: [this.setChange.set.desc, Validators.required],
      createdBy: [this.setChange.set.createdBy, Validators.required],
      years: [this.setChange.set.years, Validators.required],
      disclaimer: [this.setChange.set.disclaimer],
    });
  }

  esEvaluacion() {
    return this.setMode == "evaluacion";
  }

  getSetMode() {
    if (this.setMode == "evaluacion") {
      return "Evaluación";
    } else {
      return "Práctica";
    }
  }

  search(term: string) {
    this.questions = this.listQuestions;
    const items = this.active === 2 ? this.categories : this.questions;
    /*? this.categories
    : (this.routes.length > 0
      ? Question.getByCategory(this.routes[this.routes.length - 1].selected.questions, this.questions)
      : this.questions);*/
    if (items && items.length > 0 && term && term.length > 0) {
      term = term.trim();
      const search = this.utils.removeDiacritics(term.toLowerCase());
      if (this.active === 2) {
        this.items = items.filter((item) => {
          return this.utils.removeDiacritics(item.name).trim().toLowerCase().indexOf(search) > -1;
        });
      } else {
        this.questions = items.filter((item) => {
          return (
            this.utils.removeDiacritics(item.title).trim().toLowerCase().indexOf(search) > -1 ||
            item.number === parseInt(search, 10)
          );
        });
      }
    } else {
      this.items = this.searchCat
        ? this.categories
        : this.routes.length > 0
        ? Question.getByCategory(this.routes[this.routes.length - 1].selected.questions, this.questions)
        : this.questions;
    }
    this.sortItems();
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

  backListQuestions() {
    this.showDetailQuestion = false;
  }

  select(item: Question, refresh: boolean = false) {
    this.question = item;
    this.showDetailQuestion = true;
    /* if (item instanceof Category) {
      if (item.categories.length === 0) {
        this.searchCat = false;
        if (this.questions && this.questions.length > 0) {
          this.items = Question.getByCategory(item.questions, this.questions);
          this.sortItems();
        } else {
          this.items = [];
        }

        if (!refresh) {
          this.routes.push({selected: item, name: item.name, id: item.idCategory, items: this.items});
        } else {
          const index = this.routes.findIndex((route) => route.selected.idCategory === item.idCategory);
          if (index >= 0) {
            this.routes[index] = {selected: item, name: item.name, id: item.idCategory, items: this.items};
          }
        }
      } */
    // } else if (item instanceof Question) {
    /*this.question = item;
    if (!refresh) {
      this.routes.push({selected: item, name: item.number, id: item.idQuestion, items: []});
    }*/
    // }
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

    this.searchCat = home;
    this.routes = routes;
    this.sortItems();
  }

  verify(item: any, type: string) {
    return type === "category" ? item instanceof Category : item instanceof Question;
  }

  setSearchType(active: boolean) {
    this.searchCat = active;
    this.search(this.searchTerm);
  }

  toggleEdit() {
    if (!this.editCat) {
      let canEdit = false;
      if (this.setChange && this.setChange.use) {
        if (this.setChange.use.inUse && this.setChange.use.user.idUser === localStorage.getItem("user.idUser")) {
          canEdit = true;
        } else {
          if (this.now - this.setChange.use.at > 60 * 6 * 1000) {
            canEdit = true;
          } else {
            this.snackBar.open("Otro usuario está editando este conjunto.", "Cerrar", { duration: 3000 });
          }
        }
      } else {
        this.setChange = Change.parseSet(Object.assign({}, this.set));
        canEdit = true;
      }

      if (canEdit) {
        this.editCat = true;
        this.initForm();
      }
    } else {
      this.editCat = false;
    }
  }

  saveDraft() {
    this.loadComplete = false;
    if (this.setForm.valid) {
      this.setChange.set.name = this.setForm.value.name;
      this.setChange.set.desc = this.setForm.value.desc;
      this.setChange.set.createdBy = this.setForm.value.createdBy;
      this.setChange.set.years = this.setForm.value.years;
      this.setChange.set.disclaimer = this.setForm.value.disclaimer;
      this.saveSetData();
    } else {
      this.loadComplete = true;
    }
  }

  saveSetData() {
    this.loading = true;
    this.changeService.post(this.setChange).subscribe((data) => {
      if (data && data.values && data.values.length > 0) {
        this.checkDraft();
        this.snackBar.open("Cambio guardado correctamente", "Cerrar", {
          duration: 3000,
        });
      } else {
        this.snackBar.open("Error: inténtelo nuevamente", "Cerrar", {
          duration: 3000,
        });
      }
    });
  }

  checkDraft() {
    this.loadComplete = false;
    this.activeButtonPublish = false;

    this.changeService.get(this.setService.getIdOrganization(), this.set.idCategory, this.set.updatedAt).subscribe(
      (data) => {
        if (data && data.values && data.values.length > 0) {
          localStorage.setItem("changes-" + this.set.idCategory, JSON.stringify(data.values));
          this.changes = data.values;
          let exits = -1;
          for (let i = 0; i < this.changes.length; i++) {
            if (this.changes[i].set) {
              exits = i;
              break;
            }
          }
          this.setShow = exits > -1 ? this.changes[exits].set : this.set;
          this.addItems();
          this.homeRoute = {
            selected: this.set,
            name: this.set.name,
            id: this.set.idCategory,
            items: this.categories,
          };
          for (const change of this.changes) {
            if (/^set-\d+$/.test(change.type)) {
              this.setChange = Object.assign({}, change);
              this.initForm();
              break;
            }
          }
          this.checkCategoryEmpty();
          if (!this.loading && !this.loadQuestions) {
            this.loadComplete = true;
          }
        } else {
          this.setShow = this.set;
        }
      },
      () => {},
      () => {
        this.editCat = false;
        this.loading = false;
        if (!this.loadQuestions) {
          this.loadComplete = true;
        }
      }
    );
  }

  checkCategoryEmpty() {
    const setChange = this.changes.find((change) => /^set(\w|\W)*$/.test(change.type));
    if (setChange && setChange.set) {
      this.activeButtonPublish = true;
    } else {
      this.activeButtonPublish = this.changes.findIndex((change) => /^category(\w|\W)*$/.test(change.type)) >= 0;
    }
  }

  toHumanDate(timestamp): string {
    return UtilsService.toHumanDate(timestamp);
  }

  selectedOption(option: number) {
    this.showDetailQuestion = false;
    this.searchTerm = "";
    this.search("");
    this.active = option;
    if (this.selectedCategory) {
      this.filterCategory(this.selectedCategory);
    }
  }

  syncQuestions() {
    localStorage.setItem(
      "lastUpdateQuestion-" + this.set.idCategory,
      JSON.stringify([{ updatedAt: this.set.updatedAt }])
    );

    this.loading = true;

    this.awsService.getObjectS3(this.set.idCategory + "." + this.set.updatedAt + ".json").then((url) => {
      this.questionService.getFile(url).subscribe(
        (result) => {
          localStorage.setItem("question-" + this.set.idCategory, JSON.stringify(result));
          this.questions = [];

          if (result) {
            for (const question of result) {
              this.questions.push(Question.parse(question));
            }
          }
          this.listQuestions = this.questions;
          this.loadComplete = true;
          this.loadQuestions = false;
        },
        (error) => {
          console.error(error);
        }
      );
    });
  }

  setPagination(event) {
    this.pagination = event;
  }

  addItems() {
    for (const change of this.changes) {
      if (/^category(\w|\W)*$/.test(change.type)) {
        const category = Category.parse(change.category);
        const itemIndex = this.categories.findIndex((item) => item.idCategory === category.idCategory);
        category.type = change.action;

        if (itemIndex >= 0) {
          this.categories[itemIndex] = category;
        } else {
          this.categories.push(category);
        }
      } else if (/^question(\w|\W)*$/.test(change.type)) {
        const question = Question.parse(change.question);
        const itemIndex = this.questions.findIndex((item) => item.idQuestion === question.idQuestion);
        question.type = change.action;

        if (itemIndex >= 0) {
          this.questions[itemIndex] = question;
        } else {
          this.questions.push(question);
        }
        this.listQuestions = this.questions;
      }
    }

    if (this.routes.length === 0) {
      this.items = this.categories;
      this.sortItems();
    } else {
      let item;
      if (this.routes[this.routes.length - 1].selected instanceof Category) {
        item = this.categories.find(
          (category) => category.idCategory === this.routes[this.routes.length - 1].selected.idCategory
        );
      } else {
        item = this.questions.find(
          (question) => question.idQuestion === this.routes[this.routes.length - 1].selected.idQuestion
        );
      }

      this.select(item, true);
    }
  }

  add(category: boolean) {
    if (category) {
      if (!this.editCategory) {
        this.createCategory = new Category();
        this.createCategory.idCategory = uuid();
        this.initCategoryForm();
      }
    } else {
      if (!this.existsCategoryWithSetName()) {
        this.forceCategoryWithSetName();
      } else {
        this.createQuestion = new Question();
        this.createQuestion.idQuestion = uuid();
        this.initQuestionForm();
        this.addAlternative();
        this.addAlternative();
      }
    }
  }

  setNameCategoryExists() {
    const categoryNames = this.categories.map((c) => c.name);
    if (!categoryNames.includes(this.set.name)) {
      return false;
    }
    return true;
  }

  changeQuestionTypeOption(event) {
    for (const a of this.createQuestion.alternatives) {
      this.removeAlternative(a);
    }
    switch (event.value) {
      case "Alternativa":
        this.addAlternative();
        this.addAlternative();
        break;
      case "VerdaderoOFalso":
        this.addVoFAlternatives();
        break;
      case "Abierta":
        this.addOpenQuestionAlternative();
        break;
      default:
        this.addAlternative();
        this.addAlternative();
        break;
    }
  }

  openFileUploadDialog(category: any): void {
    this.dialog
      .uploadFile("Confirm Dialog", category.name, category, category.idCategory, this.set)
      .subscribe((res) => {
        if (res.reload) {
          this.loading = true;
          this.loadComplete = false;
          res.changes.forEach((element) => {
            this.saveData(element);
          });
          this.loadComplete = true;
          this.loading = false;
        }
      });
  }

  saveChange(change) {
    this.loading = true;
    this.loadComplete = false;

    this.saveData(change);
  }

  edit(item) {
    if (this.showDetailQuestion) {
      this.showDetailQuestion = false;
    }
    if (item instanceof Category) {
      if (!this.editCategory && !this.createCategory) {
        this.editCategory = true;
        item.edit = true;
        this.initCategoryForm(item);
      }
    } else {
      const questionType = this.findQuestionType(item.alternatives);
      item.idQuestionType = questionType;
      this.createQuestion = item;
      this.initQuestionForm(item);
    }
  }

  findQuestionType(alternatives) {
    if (!alternatives.length || alternatives.length == 1) {
      return "Abierta";
    }
    let existsVerdaderoAlternative = false;
    let existsFalseAlternative = false;
    for (const a of alternatives) {
      if (a.text == "Verdadero") {
        existsVerdaderoAlternative = true;
      } else if (a.text == "Falso") {
        existsFalseAlternative = true;
      }
    }
    if (existsVerdaderoAlternative && existsFalseAlternative) {
      return "VerdaderoOFalso";
    } else {
      return "Alternativa";
    }
  }

  addAlternative(idCategory = null) {
    this.createQuestion.title = this.questionForm.get("title").value;
    this.createQuestion.idCategory = idCategory
      ? idCategory
      : this.categories.find((c) => c.name == this.set.name.toUpperCase()).idCategory;
    this.createQuestion.idQuestionType = "Alternativa";
    for (const alternative of this.createQuestion.alternatives) {
      alternative.text = this.questionForm.get("alternative-" + alternative.idAlternative).value;
      alternative.correct = this.questionForm.get("alternative-correct").value === alternative.idAlternative;
    }

    const alternative = new Alternative();
    alternative.idAlternative = uuid();
    this.createQuestion.alternatives.push(alternative);

    this.initQuestionForm(this.createQuestion);
  }

  addVoFAlternatives() {
    this.createQuestion.title = this.questionForm.get("title").value;
    this.createQuestion.idCategory = this.categories.find((c) => c.name == this.set.name.toUpperCase()).idCategory;
    this.createQuestion.idQuestionType = "VerdaderoOFalso";

    for (const alternative of this.createQuestion.alternatives) {
      alternative.text = this.questionForm.get("alternative-" + alternative.idAlternative).value;
      alternative.correct = this.questionForm.get("alternative-correct").value === alternative.idAlternative;
    }

    const alternativeTrue = new Alternative();
    alternativeTrue.idAlternative = uuid();
    alternativeTrue.text = "Verdadero";
    const alternativeFalse = new Alternative();
    alternativeFalse.idAlternative = uuid();
    alternativeFalse.text = "Falso";
    this.createQuestion.alternatives.push(alternativeTrue);
    this.createQuestion.alternatives.push(alternativeFalse);
    this.initQuestionForm(this.createQuestion);
  }

  addOpenQuestionAlternative() {
    this.createQuestion.title = this.questionForm.get("title").value;
    this.createQuestion.idCategory = this.categories.find((c) => c.name == this.set.name.toUpperCase()).idCategory;
    this.createQuestion.idQuestionType = "Abierta";

    this.initQuestionForm(this.createQuestion);
  }

  removeAlternative(alternative: Alternative) {
    this.createQuestion.title = this.questionForm.get("title").value;
    this.createQuestion.idCategory = this.questionForm.get("idCategory").value;

    const alternatives: Array<Alternative> = [];

    for (const auxAlternative of this.createQuestion.alternatives) {
      if (auxAlternative.idAlternative !== alternative.idAlternative) {
        auxAlternative.text = this.questionForm.get("alternative-" + auxAlternative.idAlternative).value;
        auxAlternative.correct = this.questionForm.get("alternative-correct").value === auxAlternative.idAlternative;
        alternatives.push(auxAlternative);
      }
    }

    this.createQuestion.alternatives = alternatives;

    this.initQuestionForm(this.createQuestion);
  }

  selectCorrect(alternative: Alternative) {
    this.resetAlternatives();
    this.questionForm.get("alternative-correct").setValue(alternative.idAlternative);
    alternative.correct = true;
  }

  resetAlternatives() {
    for (const alternative of this.createQuestion.alternatives) {
      alternative.correct = false;
    }
  }

  checkAlternative() {
    let count;

    for (const a of this.createQuestion.alternatives) {
      count = 0;
      const text = this.questionForm.get("alternative-" + a.idAlternative).value;

      for (const b of this.createQuestion.alternatives) {
        if (text === this.questionForm.get("alternative-" + b.idAlternative).value) {
          count++;

          if (count > 1) {
            this.questionForm.get("alternative-" + a.idAlternative).setErrors({ notUnique: true });
            this.questionForm.get("alternative-" + b.idAlternative).setErrors({ notUnique: true });
          } else {
            if (this.questionForm.get("alternative-" + b.idAlternative).hasError("notUnique")) {
              this.questionForm.get("alternative-" + b.idAlternative).setErrors(null);
            }
          }
        }
      }
    }
  }

  cancelEdit(item) {
    item.edit = false;

    if (item instanceof Category) {
      this.editCategory = false;
    }
  }

  cancelAdd() {
    this.createCategory = null;
    this.createQuestion = null;
  }

  initCategoryForm(item: Category = null) {
    this.categoryForm = this.formBuilder.group({
      name: [item ? item.name : "", Validators.required],
    });
  }

  initQuestionForm(item: Question = null) {
    const config = {
      title: [item ? item.title : "", Validators.required],
      idCategory: [
        this.categories.find((c) => c.name == this.set.name.toUpperCase())
          ? this.categories.find((c) => c.name == this.set.name.toUpperCase()).idCategory
          : "",
        Validators.required,
      ],
      idQuestionType: [item ? item.idQuestionType : "Alternativa", Validators.required],
    };

    if (item && item.idQuestionType !== "Abierta") {
      let correct = "";
      for (const alternative of item.alternatives) {
        if (alternative.correct) {
          correct = alternative.idAlternative;
        }

        config["alternative-" + alternative.idAlternative] = [alternative.text, Validators.required];
      }
      config["alternative-correct"] = [correct && correct.trim() ? correct : "", Validators.required];
    }

    this.questionForm = this.formBuilder.group(config);
  }

  save(category: boolean, item = null) {
    if (category) {
      if (this.categoryForm.valid) {
        this.loading = true;
        this.loadComplete = false;
        const change = new Change(this.setService.getIdOrganization());
        let newCategory = new Category();

        if (item && !this.createCategory) {
          newCategory = item;
        } else {
          newCategory = this.createCategory;
        }

        newCategory.name = this.categoryForm.get("name").value;
        change.idSet = this.set.idCategory;
        change.createdAt = this.set.updatedAt + 1;
        change.type = "category-" + newCategory.idCategory + "-" + change.createdAt;
        change.action =
          this.set.categories.findIndex((categoryOriginal) => categoryOriginal.idCategory === newCategory.idCategory) >=
          0
            ? "update"
            : "create";
        change.category = newCategory;
        this.editCategory = false;
        this.saveData(change);
      }
    } else {
      if (
        this.questionForm.valid &&
        ((this.createQuestion.idQuestionType == "Abierta" && !this.createQuestion.alternatives.length) ||
          (this.createQuestion.idQuestionType !== "Abierta" && this.createQuestion.alternatives.length >= 2))
      ) {
        this.loading = true;
        this.loadComplete = false;
        const change = new Change(this.setService.getIdOrganization());
        let newQuestion = new Question();

        if (item && !this.createQuestion) {
          newQuestion = item;
        } else {
          if (this.createQuestion.alternatives.length) {
            for (const alternative of this.createQuestion.alternatives) {
              alternative.text = this.questionForm.get("alternative-" + alternative.idAlternative).value;
              alternative.correct = this.questionForm.get("alternative-correct").value === alternative.idAlternative;
            }
          }
          newQuestion = this.createQuestion;
        }

        newQuestion.title = this.questionForm.get("title").value;
        if (this.questionForm.get("idCategory").value !== newQuestion.idCategory && newQuestion.idCategory !== "") {
          change.removeCategory = newQuestion.idCategory;
        }

        newQuestion.idCategory = this.categories.find((c) => c.name == this.set.name.toUpperCase()).idCategory;
        change.idSet = this.set.idCategory;
        change.createdAt = this.set.updatedAt + 1;
        change.type = "question-" + newQuestion.idQuestion + "-" + change.createdAt;
        const oldQuestion = this.questions.find((question) => question.idQuestion === newQuestion.idQuestion);
        change.action = oldQuestion && oldQuestion.type !== "create" ? "update" : "create";
        change.question = newQuestion;
        this.saveData(change);
      }
    }
  }

  delete(item: any, activeUpdateCat?: boolean) {
    let change: Change;

    if (item instanceof Question) {
      change = this.changes.find(
        (searchChange) => searchChange.question && searchChange.question.idQuestion === item.idQuestion
      );
    } else {
      change = this.changes.find(
        (searchChange) => searchChange.category && searchChange.category.idCategory === item.idCategory
      );
    }

    if (!change) {
      // Solo para formularios publicados //
      const changeNew = {
        idSet: this.set.idCategory,
        action: "delete",
        type: "",
        question: {},
        category: {},
        createdAt: this.set.updatedAt + 1,
      };
      if (item instanceof Question) {
        changeNew.type = "question-" + item.idQuestion + "-" + (this.set.updatedAt + 1);
        changeNew.question = item;
        delete changeNew.category;
      } else {
        changeNew.type = "category-" + item.idCategory + "-" + (this.set.updatedAt + 1);
        changeNew.category = item;
        delete changeNew.question;
      }
      this.dialog
        .confirmDeleteTypeChange(
          "Borrar cambio",
          "Se borrara el cambio seleccionado",
          changeNew.type,
          changeNew.idSet,
          changeNew,
          false
        )
        .subscribe((res) => {
          if (res && res.reload) {
            this.setQuestions();
            this.setCategories();
            this.checkDraft();
          }
        });
    } else {
      if (item instanceof Question) {
        let exist = false;
        if (this.set.questions.find((id) => id === change.question.idQuestion)) {
          exist = true;
        }
        this.dialog
          .confirmDeleteTypeChange(
            "Borrar cambio",
            "Se borrara el cambio seleccionado",
            change.type,
            change.idSet,
            exist ? change : null,
            exist
          )
          .subscribe((res) => {
            if (res && res.reload) {
              this.setQuestions();
              this.setCategories();
              this.checkDraft();
            }
          });
      } else {
        let exist = false;
        if (this.set.categories.findIndex((itemSearch) => itemSearch.idCategory === item.idCategory) > -1) {
          exist = true;
        }
        this.dialog
          .confirmDeleteTypeChange(
            "Borrar cambio",
            "Se borrara el cambio seleccionado",
            change.type,
            change.idSet,
            exist ? change : null,
            exist,
            activeUpdateCat
          )
          .subscribe((res) => {
            if (res && res.reload) {
              this.setQuestions();
              this.setCategories();
              this.checkDraft();
            }
          });
      }
    }
  }
  // toast: boolean = true
  saveData(change: Change, newCategory: boolean = false) {
    const type = /^question(\w|\W)*$/.test(change.type) ? "Pregunta" : "Categoría";
    const action = /^delete(\w|\W)*$/.test(change.action)
      ? "eliminada"
      : /^create(\w|\W)*$/.test(change.action)
      ? "creada"
      : "editada";
    this.changeService.post(change).subscribe(() => {
      if (newCategory) {
        this.createQuestion = new Question();
        this.createQuestion.idQuestion = uuid();
        this.initQuestionForm();
        this.addAlternative(change.category.idCategory);
        this.addAlternative(change.category.idCategory);
        this.snackBar.open(
          "Se creó una nueva categoría para inicializar el conjunto. Porfavor vuelva a intentar agregar una pregunta",
          "Cerrar",
          {
            duration: 10000,
          }
        );
      } else {
        this.snackBar.open(type + " " + action + " correctamente", "Cerrar", {
          duration: 3000,
        });
      }
      this.checkDraft();
      this.cancelAdd();
    });
  }

  checkCategoryDelete(item: Category) {
    let category = this.set.categories.find((itemCategory) => itemCategory.idCategory === item.idCategory);
    if (!category) {
      category = item;
    }
    let exist = 0;
    for (let i = 0; i < category.questions.length; i++) {
      const change = this.changes.find(
        (id) =>
          /^question(\w|\W)*$/.test(id.type) &&
          id.action === "delete" &&
          id.question.idQuestion &&
          id.question.idQuestion === category.questions[i]
      );
      if (change) {
        exist = exist + 1;
      }
    }
    if (exist === category.questions.length) {
      return true;
    }
  }

  checkDeleteQuestion(item: Question) {
    return this.changes.find(
      (id) =>
        /^category(\w|\W)*$/.test(id.type) &&
        id.action === "delete" &&
        id.category &&
        id.category.idCategory &&
        item.idCategory === id.category.idCategory
    )
      ? false
      : true;
  }

  checkEditCategory(item: Category) {
    const category = this.set.categories.find((itemCategory) => itemCategory.idCategory === item.idCategory);
    if (category) {
      return this.changes.find(
        (id) =>
          /^category(\w|\W)*$/.test(id.type) &&
          id.action === "update" &&
          id.category &&
          id.category.idCategory &&
          item.idCategory === id.category.idCategory
      )
        ? true
        : false;
    } else {
      return false;
    }
  }

  setCategoryName(item: Question) {
    return this.categories[this.categories.findIndex((category) => item.idCategory === category.idCategory)].name;
  }

  setNumberQuestions(category: Category) {
    return category.questions.length;
  }

  filterCategory(item: any) {
    const questions = this.listQuestions;

    if (item) {
      this.questions = questions.filter((category) => {
        return category.idCategory === item;
      });
    } else {
      this.questions = this.listQuestions;
    }
    this.questions.sort((a, b) => {
      return a.number - b.number;
    });
    this.setPagination(1);
  }

  removeHtmlTags(text: string) {
    return text.replace(/<(?:.|\n)*?>/gm, "");
  }

  truncateChar(text: string): string {
    let charlimit = 100;
    if (!text || text.length <= charlimit) {
      return this.removeHtmlTags(text);
    }

    let without_html = this.removeHtmlTags(text);
    let shortened = without_html.substring(0, charlimit) + "...";
    return shortened;
  }

  existsCategoryWithSetName() {
    const cat = this.categories.find((c) => c.name == this.set.name.toUpperCase());
    return cat ? true : false;
  }

  forceCategoryWithSetName() {
    const change = new Change(this.setService.getIdOrganization());
    let newCategory = new Category();
    this.createCategory = new Category();
    this.createCategory.idCategory = uuid();
    newCategory = this.createCategory;
    newCategory.name = this.set.name.toLocaleUpperCase();
    change.idSet = this.set.idCategory;
    change.createdAt = this.set.updatedAt + 1;
    change.type = "category-" + newCategory.idCategory + "-" + change.createdAt;
    change.action = "create";
    change.category = newCategory;
    this.editCategory = false;
    this.saveData(change, true);
  }

  ngOnInit() {
    localStorage.removeItem("users");
    this.setVideo = this.set.video || "";
    this.setUrl = this.set.url || "";
    this.setMode = this.set.mode || "practica";
    this.getDefaultStatus();
  }

  getDefaultStatus() {
    this.setService.getDefaultSets().subscribe((response) => {
      const defaultSets: any[] = response.body;
      const isIncluded = defaultSets.find((set) => set.idCategory == this.set.idCategory);
      this.defaultButtonText = isIncluded ? "Quitar set por defecto" : "Convertir en set por defecto";
      this.isDefaultSet = !!isIncluded;
    });
  }

  changeDefaultStatus() {
    // Dependiendo si ya está o no, tengo que quitar o agregar
    if (this.isDefaultSet) {
      this.setService.deleteDefaultSet(this.set.idCategory).subscribe(
        () => {
          this.getDefaultStatus();
        },
        (err) => {
          console.log(err);
        }
      );
    } else {
      this.setService.addDefaultSet(this.set.idCategory).subscribe(
        () => {
          this.getDefaultStatus();
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
}
