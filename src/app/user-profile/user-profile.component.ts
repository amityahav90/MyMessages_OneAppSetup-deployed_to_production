import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import { Post } from '../posts/post.model';
import { PostsService } from '../posts/posts.service';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/internal/operators';
import {AuthService} from '../auth/auth.service';
import {User} from './user.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userId: string;
  userPosts: Post[];
  // editMode = false;
  user: User;
  currentUserId: string;
  private postsSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostsService,
    private router: Router,
    private authService: AuthService) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.userId = this.route.snapshot.params['id'];
    this.postsSubscription = this.postService.getAllUserPosts(this.userId)
      .subscribe(transformedPost => {
        this.userPosts = transformedPost.posts;
      });

    this.userSubscription = this.authService.getUserById(this.userId)
      .subscribe(userData => {
        this.user = userData;
      });
  }

  onGoToPost(postId: string) {
    this.router.navigate(['/post/' + postId]);
  }

  // onEditProfile() {
  //   this.editMode = !this.editMode;
  // }

  onDelete(postId: string) {
    this.postService.deletePost(postId)
      .subscribe(() => {
        this.postService.getAllUserPosts(this.userId)
          .subscribe(transformedPost => {
            this.userPosts = transformedPost.posts;
          });
      });
  }

  ngOnDestroy() {
    this.postsSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }
}
