export interface Comment {
  _id: string;
  authorId: string;
  username: string;
  postId: string;
  likes: number;
  date: Date;
  content: string;
  authorImage: string;
}
