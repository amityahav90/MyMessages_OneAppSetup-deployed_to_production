import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PostsService} from '../posts.service';
import {Post} from '../post.model';
import {map} from 'rxjs/internal/operators';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  postId: string;
  post: Post;
  userId: string;
  userIsAuthenticated = false;
  private authStatusSub: Subscription;
  private subscription: Subscription;


  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService,
    private authService: AuthService) {}

  ngOnInit() {
    console.log('here');
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    this.postsService.getPosts(10, 1);
    this.postId = this.route.snapshot.params['id'];
    this.postsService.getPost(this.postId)
      .pipe(map(postData => {
        const transformedPost: Post = {
          topic: postData.topic,
          title: postData.title,
          content: postData.content,
          likes: postData.likes,
          creator: postData.creator,
          creatorUsername: postData.creatorUsername,
          imagePath: postData.imagePath,
          id: postData._id
        };
        return transformedPost;
      }))
      .subscribe(result => {
        this.post = result;
      });

    this.subscription = this.postsService.getSinglePostUpdatedListener()
      .subscribe((post: Post) => {
        this.post = post;
      });
  }

  onLikeClicked() {
    this.postsService.updateLikes(this.authService.getUserId(), this.postId);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
