import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import { map } from 'rxjs/internal/operators';
import {Params, Router} from '@angular/router';

import { Post } from './post.model';
import { environment } from '../../environments/environment';
import index from '@angular/cli/lib/cli';

const BACKEND_URL = environment.apiUrl + '/posts';

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();
  private postUpdated = new Subject<Post>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number, filter?: string) {
    let queryParams;
    if (!filter) {
      queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    } else {
      queryParams = `?pagesize=${postsPerPage}&page=${currentPage}&filter=${filter}`;
    }
    this.http
      .get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              topic: post.topic,
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              creatorUsername: post.creatorUsername,
              likes: post.likes
            };
          }),
          maxPosts: postData.maxPosts};
      }))
      .subscribe(
        (transformedPostData) => {
          this.posts = transformedPostData.posts;
          this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
        }
      );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getSinglePostUpdatedListener() {
    return this.postUpdated.asObservable();
  }


  addPost(topic: string, title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('topic', topic);
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
      .subscribe(
        (responseData) => {
          this.router.navigate(['/posts']);
        });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + '/' + postId);
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      topic: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
      creatorUsername: string;
      likes: number; }>(BACKEND_URL + '/' + id);
  }

  updatePost(id: string, topic: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;

    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('topic', topic);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        topic: topic,
        title: title,
        content: content,
        imagePath: image,
        creator: null,
        creatorUsername: null,
        likes: null
      };
    }

    this.http
      .put(BACKEND_URL + '/' + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  updateLikes(userId: string, postId: string) {
    const data = { userId: userId, postId: postId };
    this.http.post<{ message: string, postsAmount: number }>(environment.apiUrl + '/like', data)
      .subscribe(response => {
        const postIndex = this.getPostIndex(postId);
        if (response.message === 'like') {
          this.posts[postIndex].likes++;
        } else if (response.message === 'unlike') {
          this.posts[postIndex].likes--;
        }
        this.postsUpdated.next({posts: [...this.posts], postCount: +response.postsAmount});
        this.postUpdated.next(this.posts[postIndex]);
      });
  }

  getPostIndex(postId: string) {
    let i = 0;
    for (const post of this.posts) {
      if (post.id === postId) {
        return i;
      }
      i++;
    }
  }

  getAllUserPosts(userId: string) {
    return this.http.get<{ message: string, posts: Post[] }>(BACKEND_URL + '/user/' + userId)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              topic: post.topic,
              title: post.title,
              content: post.content,
              likes: post.likes,
              creator: post.creator,
              creatorUsername: post.creatorUsername,
              imagePath: post.imagePath,
              id: post.id
            };
          })
        };
      }));
  }


}
