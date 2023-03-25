import {Component,  OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Group} from '../../shared/models/group';
import {Router} from '@angular/router';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  group: Group;

  constructor(private route: ActivatedRoute,
              private router: Router) {

    // this.route.parent.params.subscribe((setParams) => {
    //   if (setParams && setParams.idSet) {
    //     this.route.params.subscribe((groupParams) => {
    //       if (groupParams && groupParams.idGroup) {
    //         const groups: Array<Group> = JSON.parse(localStorage.getItem('groups-' + setParams.idSet));
    //         if (groups && groups.length > 0) {
    //           for (const group of groups) {
    //             if (group.idGroup === groupParams.idGroup) {
    //               this.group = group;
    //               break;
    //             }
    //           }
    //         }
    //       }
    //     });
    //   }
    // });
  }

  ngOnInit() {}

}
