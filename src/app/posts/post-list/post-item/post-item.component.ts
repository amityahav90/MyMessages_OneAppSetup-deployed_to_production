import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../../post.model';
import {AuthService} from '../../../auth/auth.service';
import {Subject, Subscription} from 'rxjs';
import {CommentsService} from './comments.service';

@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.css']
})
export class PostItemComponent implements OnInit, OnDestroy {
  @Input() post: Post;
  commentInput: string;
  comments: Comment[] = [];
  userIsAuthenticated = false;
  editMode = false;
  currentEditedComment: string;
  userId: string;
  private authStatusSub: Subscription;
  private commentsUpdate = new Subject<Comment[]>();

  constructor(private authService: AuthService, private commentsService: CommentsService) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userId = this.authService.getUserId();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
    this.getAllComments();
  }

  getAllComments() {
    this.commentsService.getCommentsOfPost(this.post.id)
      .subscribe(comments => {
        this.comments = comments.comments;
        this.commentsUpdate.next([...this.comments]);
      });
  }

  onAddComment() {
    if (this.commentInput === '') {
      return;
    }
    this.commentsService.createComment(this.authService.getUserId(), this.post.id, this.commentInput)
      .subscribe(() => {
        this.getAllComments();
        this.commentInput = '';
      });
  }

  onEditComment(commentId: string) {
    this.currentEditedComment = commentId;
    this.editMode = true;
  }

  onSaveCommentChanges(commentId: string, comment: HTMLInputElement) {
    this.commentsService.updateComment(commentId, comment.value)
      .subscribe(result => {
        this.editMode = false;
        this.getAllComments();
      });
  }

  onLikeClicked(commentId: string) {
    this.commentsService.updateLikesOfComment(commentId, this.authService.getUserId())
      .subscribe(result => {
        this.getAllComments();
      });
  }

  onDeleteComment(commentId: string) {
    this.commentsService.deleteComment(commentId)
      .subscribe(() => {
        this.getAllComments();
      });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
