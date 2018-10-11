import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  topics: any[] = [
    { value: 'Sport', viewValue: 'Sport' },
    { value: 'Food', viewValue: 'Food' },
    { value: 'Gaming', viewValue: 'Gaming' },
    { value: 'Shopping', viewValue: 'Shopping' },
    { value: 'Vacations', viewValue: 'Vacations' },
    { value: 'Technology', viewValue: 'Technology' },
    { value: 'Other', viewValue: 'Other' },
  ];
  selectedTopics: Array<string> = [];
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 10;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private subscription: Subscription;
  private authStatusSub: Subscription;
  private usernameSub: Subscription;

  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.isLoading = true;
    this.subscription = this.postsService.getPostUpdateListener()
      .subscribe(
        (postData: {posts: Post[], postCount: number}) => {
          this.isLoading = false;
          this.totalPosts = postData.postCount;
          this.posts = postData.posts;
        });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId)
      .subscribe(() => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      }, () => {
        this.isLoading = false;
      });
  }

  onSelectTopic(event) {
    const currentSelection = event.option.value;
    if (this.selectedTopics.includes(currentSelection)) {
      this.selectedTopics.splice(this.selectedTopics.indexOf(currentSelection), 1);
      this.postsService.getPosts(this.postsPerPage, this.currentPage, this.selectedTopics.toString());
      // this.postsService.getPosts(this.postsPerPage, this.currentPage);
    } else {
      this.selectedTopics.push(currentSelection);
      // this.postsService.getPosts(this.postsPerPage, this.currentPage, currentSelection);
      this.postsService.getPosts(this.postsPerPage, this.currentPage, this.selectedTopics.toString());
    }
  }

  onClearAll(topicList: any) {
    topicList.deselectAll();
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onLikeClicked(post: Post) {
    this.postsService.updateLikes(this.authService.getUserId(), post.id);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
