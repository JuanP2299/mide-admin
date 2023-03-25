import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwsService } from './services/aws/aws.service';
import { UserService } from './services/user/user.service';
import { AuthService } from './services/auth/auth.service';
import { SetService } from './services/set/set.service';
import { OrganizationService } from './services/organization/organization.service';
import { GroupService } from './services/group/group.service';
import { GroupsUsersService } from './services/groups_users/groups.users.service';
import { StatisticService } from './services/statistic/statistic.service';
import { TeacherService } from './services/teacher/teacher.service';
import { ProgressBarService } from './services/progress-bar/progress-bar.service';
import { LocalProvider } from './services/local/local.service';
import { DialogServiceService } from './services/dialog-service/dialog-service.service';
import { BreadcrumbService } from './services/breadcrumb/breadcrumb.service';
import { QuestionService } from './services/question/question.service';
import { ActionService } from './services/action/action.service';
import { DialogDeleteService } from './services/dialog-service/dialog-delete-service.service.service';
import { ModalQuestionService } from './services/dialog-service/modal-question.service';
import { UtilsService } from './services/utils/utils.service';
import { ChangeService } from './services/change/change.service';
import { DiscussionService } from './services/discussion/discussion.service';
import { AttemptsService } from './services/attemps/attempts.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    AwsService,
    UserService,
    AuthService,
    SetService,
    OrganizationService,
    GroupService,
    GroupsUsersService,
    StatisticService,
    ProgressBarService,
    LocalProvider,
    DialogServiceService,
    BreadcrumbService,
    QuestionService,
    ActionService,
    DialogDeleteService,
    ModalQuestionService,
    UtilsService,
    ChangeService,
    DiscussionService,
    TeacherService,
    AttemptsService
  ]
})
export class SharedModule {}
