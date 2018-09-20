import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import { Post } from '../posts/post.model';
import { PostsService } from '../posts/posts.service';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/internal/operators';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userId: string;
  userPosts: Post[];
  private postsSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostsService,
    private router: Router) {}

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'];
    this.postsSubscription = this.postService.getAllUserPosts(this.userId)
      .subscribe(transformedPost => {
        this.userPosts = transformedPost.posts;
      });
  }

  onGoToPost(postId: string) {
    this.router.navigate(['/post/' + postId]);
  }

  ngOnDestroy() {
    this.postsSubscription.unsubscribe();
  }
}
