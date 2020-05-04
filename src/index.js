import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { SwipeableComments } from "./SwipeableComments.js";
// import { loadRedditComments } from "./data/redditParser.js";

const allComments = require("./data/comments.json");
const parentId = "";
const allCommentsMap = {};

const moreCommentsMap = {};
const moreCommentRepliesMap = {};
//   {
//   "77e11830-20e7-46e6-b084-f8b257288e99": { indexOfNextComments: 1 }
// };
const initialComments = [];

const levelCountMap = {};
// MAX COMMENTS PER LEVEL
const MAX = 5;
// MAX COMMENT REPLIES PER COMMENT
const MAX_DEPTH = 2;

allComments.forEach(c => {
  levelCountMap[c.parentId] = (levelCountMap[c.parentId] || 0) + 1;
  const level = Math.floor((levelCountMap[c.parentId] - 1) / MAX);
  if ((levelCountMap[c.parentId] % MAX) / MAX === 0) {
    const totalAtLevel = allComments.filter(c2 => c2.parentId === c.parentId)
      .length;
    const currentCount = (level + 1) * MAX;
    const remainingAtLevel = totalAtLevel - currentCount;
    if (remainingAtLevel !== 0) {
      const toLoad = remainingAtLevel > MAX ? MAX : remainingAtLevel;
      moreCommentsMap[c.id] = {
        indexOfNextComments: level + 1,
        toLoad
      };
    }
  }

  if (!allCommentsMap[c.parentId]) {
    allCommentsMap[c.parentId] = [];
  }
  if (!allCommentsMap[c.parentId][level]) {
    allCommentsMap[c.parentId][level] = [];
  }
  allCommentsMap[c.parentId][level].push(c);
});

const loadComments = (sourceComments, targetComments) => {
  loadCommentsRecursive(sourceComments, targetComments, 0, true);
};

const loadCommentsRecursive = (
  sourceComments,
  targetComments,
  level,
  saveComment
) => {
  sourceComments.forEach(c => {
    if (saveComment) {
      targetComments.push(c);
    }
    if (allCommentsMap[c.id]) {
      if (level < MAX_DEPTH - 1) {
        loadCommentsRecursive(
          allCommentsMap[c.id][0],
          targetComments,
          level + 1,
          saveComment
        );
      } else if (level === MAX_DEPTH - 1) {
        moreCommentRepliesMap[c.id] = {
          indexOfNextComments: level + 1,
          numOfChildren: getChildrenDepth(c)
        };
        loadCommentsRecursive(
          allCommentsMap[c.id][0],
          targetComments,
          0,
          false
        );
      }
    }
  });
};

const getChildrenDepth = (comment, level) => {
  if (allCommentsMap[comment.id]) {
    return 1 + getChildrenDepth(allCommentsMap[comment.id][0][0]);
  }
  return 0;
};

loadComments(allCommentsMap[parentId][0], initialComments);

function App() {
  const [comments, setComments] = useState(initialComments);
  // useEffect(() => {
  // const test = async () => {
  //   const c = await loadRedditComments();
  //   setComments(c.commentList);
  // };
  // test();
  //   setComments(initialComments);
  // }, []);

  const getMoreComments = (pId, indexOfNextComments) => {
    console.log("loading more comments");
    setComments([...comments, ...allCommentsMap[pId][indexOfNextComments]]);
  };

  const getMoreReplies = id => {
    console.log("loading more replies: ", id);
    const newComments = [];
    loadComments(allCommentsMap[id][0], newComments);
    setComments([...comments, ...newComments]);
  };

  return (
    <div className="App">
      <SwipeableComments
        comments={comments}
        moreCommentsMap={moreCommentsMap}
        moreCommentRepliesMap={moreCommentRepliesMap}
        getMoreComments={getMoreComments}
        getMoreReplies={getMoreReplies}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
