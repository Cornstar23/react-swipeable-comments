import React, { useState, useEffect } from "react";
import SwipeableViews from "react-swipeable-views";
import virtualize from "./virtualizeWithChildren";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./styles.css";
import Comment from "./Comment";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

const styles = {
  slideContainer: {
    width: "calc(100% - 20px)",
  },
};

// MAX COMMENTS PER LEVEL
const MAX = 5;
// MAX COMMENT REPLIES PER COMMENT
const MAX_DEPTH = 2;

function buildCommentsMap(sourceComments) {
  const levelCountMap = {};
  const allCommentsMap = {};
  const moreCommentsMap = {};
  sourceComments.forEach((c) => {
    levelCountMap[c.parentId] = (levelCountMap[c.parentId] || 0) + 1;
    const level = Math.floor((levelCountMap[c.parentId] - 1) / MAX);

    // TODO: Separate setting the moreCommentsMap
    if ((levelCountMap[c.parentId] % MAX) / MAX === 0) {
      const totalAtLevel = sourceComments.filter(
        (c2) => c2.parentId === c.parentId
      ).length;
      const currentCount = (level + 1) * MAX;
      const remainingAtLevel = totalAtLevel - currentCount;
      if (remainingAtLevel !== 0) {
        const toLoad = remainingAtLevel > MAX ? MAX : remainingAtLevel;
        moreCommentsMap[c.id] = {
          indexOfNextComments: level + 1,
          toLoad,
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
  return { allCommentsMap, moreCommentsMap };
}

function loadComments(allCommentsMap, id) {
  const targetComments = [];
  const moreCommentRepliesMap = {};
  if(!!allCommentsMap?.[id]?.[0]) {
    loadCommentsRecursive(
      allCommentsMap,
      allCommentsMap[id][0],
      targetComments,
      moreCommentRepliesMap,
      0,
      true
    );
  }
  return { targetComments, moreCommentRepliesMap };
}

function loadComments2(allCommentsMap, id) {
  const targetComments = [];
  if(!!allCommentsMap?.[id]?.[0]) {
  loadCommentsRecursive2(
    allCommentsMap,
    allCommentsMap[id][0],
    targetComments,
    0,
    true
  );
  }
  return targetComments;
}

function loadCommentsRecursive(
  allCommentsMap,
  sourceComments,
  targetComments,
  moreCommentRepliesMap,
  level,
  saveComment
) {
  sourceComments.forEach((c) => {
    if (saveComment) {
      targetComments.push(c);
    }
    if (allCommentsMap[c.id]) {
      if (level < MAX_DEPTH - 1) {
        loadCommentsRecursive(
          allCommentsMap,
          allCommentsMap[c.id][0],
          targetComments,
          moreCommentRepliesMap,
          level + 1,
          saveComment
        );
      } else if (level === MAX_DEPTH - 1) {
        moreCommentRepliesMap[c.id] = {
          indexOfNextComments: level + 1,
          numOfChildren: getChildrenDepth(allCommentsMap, c),
        };
        loadCommentsRecursive(
          allCommentsMap,
          allCommentsMap[c.id][0],
          targetComments,
          moreCommentRepliesMap,
          0,
          false
        );
      }
    }
  });
}

function loadCommentsRecursive2(
  allCommentsMap,
  sourceComments,
  targetComments,
  level,
  saveComment
) {
  sourceComments.forEach((c) => {
    if (saveComment) {
      targetComments.push(c);
    }
    if (allCommentsMap[c.id]) {
      if (level < MAX_DEPTH - 1) {
        loadCommentsRecursive2(
          allCommentsMap,
          allCommentsMap[c.id][0],
          targetComments,
          level + 1,
          saveComment
        );
      } else if (level === MAX_DEPTH - 1) {
        loadCommentsRecursive2(
          allCommentsMap,
          allCommentsMap[c.id][0],
          targetComments,
          0,
          false
        );
      }
    }
  });
}

function getChildrenDepth(allCommentsMap, comment) {
  if (allCommentsMap[comment.id]) {
    return (
      1 + getChildrenDepth(allCommentsMap, allCommentsMap[comment.id][0][0])
    );
  }
  return 0;
}

export function SwipeableComments({ comments }) {
  const commentMap = {};
  const [hashIndex, setHashIndex] = useState({});
  const [displayedComments, setDisplayedComments] = useState([]);
  const [allCommentsMap, setAllCommentsMap] = useState({});
  const [moreCommentsMap, setMoreCommentsMap] = useState({});
  const [moreCommentRepliesMap, setMoreCommentRepliesMap] = useState({});

  useEffect(() => {
    const { allCommentsMap: am, moreCommentsMap: mcm } =
      buildCommentsMap(comments);
    const parentId = "";
    const { targetComments, moreCommentRepliesMap: mcrm } = loadComments(am, parentId);
    setAllCommentsMap(am);
    setMoreCommentsMap(mcm);
    setDisplayedComments(targetComments);
    setMoreCommentRepliesMap(mcrm);
  }, [comments]);

  const _setHashIndex = (id, index) => {
    setHashIndex({ ...hashIndex, [id]: index });
  };

  function getMoreComments(pId, indexOfNextComments) {
    console.log("loading more comments");
    setDisplayedComments([
      ...displayedComments,
      ...allCommentsMap[pId][indexOfNextComments],
    ]);
  }

  function getMoreReplies(id) {
    console.log("loading more replies: ", id);
    const newComments = loadComments2(allCommentsMap, id);
    setDisplayedComments([...displayedComments, ...newComments]);
  }

  const commentTree = (parentId, level, parentVisible) => {
    const currentIndex = hashIndex[parentId] || 0;

    let commentsAtThisLevel = commentMap[parentId];
    if (!commentsAtThisLevel) {
      commentsAtThisLevel = displayedComments.filter(
        (c) => c.parentId === parentId
      );
      commentMap[parentId] = commentsAtThisLevel;
    }

    const commentsDivs = commentsAtThisLevel.map((comment, i) => (
      <Comment
        key={comment.id}
        comment={comment}
        level={level}
        moreCommentRepliesMap={moreCommentRepliesMap[comment.id]}
        isLastVisibleComment={
          displayedComments.filter((c) => c.parentId === comment.id).length ===
          0
        }
        getMoreReplies={getMoreReplies}
        displayChildren={i + 2 > currentIndex && i - 2 < currentIndex}
        isVisible={parentVisible && i === currentIndex}
      >
        {commentTree(
          comment.id,
          level + 1,
          parentVisible && i === currentIndex
        )}
      </Comment>
    ));

    return (
      commentsDivs.length > 0 && (
        <div className="children-comments">
          {commentsAtThisLevel.length > 1 ? (
            <div className="comment-header">
              <button
                onClick={() => {
                  const newIndex = (hashIndex[parentId] || 1) - 1;
                  _setHashIndex(parentId, newIndex);
                }}
                className={currentIndex === 0 ? "disabled" : "enabled"}
                disabled={currentIndex === 0}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div className="comment-number">
                {currentIndex + 1} of {commentsAtThisLevel.length}
              </div>

              <input
                type="range"
                min="1"
                max={commentsAtThisLevel.length}
                value={currentIndex + 1}
                onMouseDown={() => console.log("test click")}
                onChange={(e) => _setHashIndex(parentId, e.target.value - 1)}
                className="slider"
                id="myRange"
              />

              <button
                onClick={() => {
                  const newIndex = (hashIndex[parentId] || 0) + 1;
                  if (newIndex < commentsAtThisLevel.length) {
                    _setHashIndex(parentId, newIndex);
                  }
                }}
                className={
                  currentIndex === commentsAtThisLevel.length - 1
                    ? "disabled"
                    : "enabled"
                }
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
              {moreCommentsMap[commentsAtThisLevel[currentIndex].id] &&
                currentIndex === commentsAtThisLevel.length - 1 && (
                  <button
                    className="loadMoreComments"
                    onClick={() =>
                      getMoreComments(
                        parentId,
                        moreCommentsMap[commentsAtThisLevel[currentIndex].id]
                          .indexOfNextComments
                      )
                    }
                  >
                    {
                      moreCommentsMap[commentsAtThisLevel[currentIndex].id]
                        .toLoad
                    }{" "}
                    more...
                  </button>
                )}
            </div>
          ) : (
            <div className="spacer" />
          )}

          <VirtualizeSwipeableViews
            onChangeIndex={(i) => {
              _setHashIndex(parentId, i);
            }}
            index={hashIndex[parentId] || 0}
            slideCount={commentsDivs.length}
            overscanSlideBefore={2}
            overscanSlideAfter={2}
            slideStyle={level === 0 ? styles.slideContainer : null}
            resistance
            className="swipeable-views"
          >
            {commentsDivs}
          </VirtualizeSwipeableViews>
        </div>
      )
    );
  };

  return <div className="App">{commentTree("", 0, true)}</div>;
}
