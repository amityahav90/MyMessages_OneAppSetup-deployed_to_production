import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {logger} from 'codelyzer/util/logger';

const BACKEND_URL = environment.apiUrl + '/comments/';

@Injectable()
export class CommentsService {

  constructor(private http: HttpClient) {}

  createComment(authorId: string, postId: string, content: string) {
    const commentData = {
      authorId: authorId,
      postId: postId,
      date: Date.now(),
      content: content
    };
    return this.http.post(BACKEND_URL, commentData);
  }

  getCommentsOfPost(postId: string) {
    return this.http.get<{message: string, comments: Comment[]}>(BACKEND_URL + postId);
  }

  updateComment(commentId: string, content: string, likes?: number) {
    let data;
    if (likes) {
      data = {
        content: content,
        likes: likes
      };
    } else {
      data = {
        content: content
      };
    }
    return this.http.put<{message: string, comment: Comment}>(BACKEND_URL + commentId, data);
  }

  updateLikesOfComment(commentId: string, userId: string) {
    const data = {
      userId: userId,
      commentId: commentId
    };
    return this.http.post<{message: string}>(BACKEND_URL + 'like', data);
  }

  deleteComment(commentId: string) {
    return this.http.delete(BACKEND_URL + commentId);
  }
}
