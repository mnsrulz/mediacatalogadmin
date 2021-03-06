import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Media } from '../media';
import { MediaService } from '../media.service';
import { MatPaginator } from "@angular/material/paginator";
import { MatSpinner } from "@angular/material/progress-spinner";
import { MatTableDataSource } from "@angular/material/table";
import { MatInput } from "@angular/material/input";
import { MatSort } from '@angular/material/sort';

import { DataSource } from '@angular/cdk/table';
import { PagedList } from 'src/app/paged.list';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { observe } from "rxjs-observe";
import { SearchBoxComponent } from "src/app/components/search-box/search-box.component"

@Component({
  selector: 'media-list',
  templateUrl: './media-list.component.html',
  styleUrls: ['./media-list.component.scss'],
  providers: [MediaService]
})

export class MediaListComponent implements AfterViewInit {

  medias: Media[]
  selectedMedia: Media
  dataSource;
  searchQuery: string = "";
  totalCount: number = 0;
  isLoadingResults: boolean = true;
  pageNo: number = 1;


  displayedColumns: string[] = ['name', 'source', 'mimeType', 'size', 'quality', 'imdb'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(SearchBoxComponent) search: SearchBoxComponent;

  constructor(private mediaService: MediaService) { }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.search.search.subscribe(() => {
      this.pageNo = 1;
      this.paginator.pageIndex = 0;
    });

    merge(this.sort.sortChange, this.paginator.page, this.search.search)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.mediaService
            .getMedias(this.paginator.pageIndex + 1, this.paginator.pageSize, this.search.inputModel);
          // .then((medias: PagedList<Media>) => {
          //   this.dataSource = new MatTableDataSource(medias.items);
          // });

          // return this.exampleDatabase!.getRepoIssues(
          //   this.sort.active, this.sort.direction, this.paginator.pageIndex);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.pageNo = (data as PagedList<Media>).pageNo;
          this.paginator.length = (data as PagedList<Media>).totalCount;
          return data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          return observableOf([]);
        })
      ).subscribe(data => this.dataSource = new MatTableDataSource((data as PagedList<Media>).items));
  }

  // private getIndexOfContact = (contactId: String) => {
  //   return this.medias.findIndex((contact) => {
  //     return contact._id === contactId;
  //   });
  // }

  // selectContact(media: Media) {
  //   this.selectedMedia = media
  // }

  // createNewContact() {
  //   var contact: Contact = {
  //     name: '',
  //     email: '',
  //     phone: {
  //       work: '',
  //       mobile: ''
  //     }
  //   };

  //   // By default, a newly-created contact will have the selected state.
  //   this.selectContact(contact);
  // }

  // deleteContact = (contactId: String) => {
  //   var idx = this.getIndexOfContact(contactId);
  //   if (idx !== -1) {
  //     this.contacts.splice(idx, 1);
  //     this.selectContact(null);
  //   }
  //   return this.contacts;
  // }

  // addContact = (contact: Contact) => {
  //   this.contacts.push(contact);
  //   this.selectContact(contact);
  //   return this.contacts;
  // }

  // updateContact = (contact: Contact) => {
  //   var idx = this.getIndexOfContact(contact._id);
  //   if (idx !== -1) {
  //     this.contacts[idx] = contact;
  //     this.selectContact(contact);
  //   }
  //   return this.contacts;
  // }
}