import axios from "axios";

export const loadRedditComments = async () => {
  const json = await axios.get(
    "https://www.reddit.com/r/EnoughTrumpSpam/comments/gcv018/scared_little_bitches.json"
  );
  const comments = json.data[1].data.children;
  const articleTitle = json.data[0].data.children[0].data.title;
  const articleText = json.data[0].data.children[0].data.selftext;
  const commentList = [];

  const commentFunction = comments => {
    comments.forEach(comment => {
      if (comment.kind !== "more") {
        const parentId =
          comment.data.parent_id.substring(0, 2) === "t3"
            ? ""
            : comment.data.parent_id.substring(3);
        const id = comment.data.id;
        const text = comment.data.body;
        const author = comment.data.author;

        const newComment = {
          id,
          parentId,
          author,
          text
        };
        commentList.push(newComment);

        if (comment.data.replies !== "") {
          commentFunction(comment.data.replies.data.children);
        }
      }
    });
  };

  commentFunction(comments);
  const redditPost = {
    articleTitle,
    articleText,
    commentList
  };
  return redditPost;
};
