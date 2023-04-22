import React, { useState, useEffect } from "react";
import SwipeableViews from "react-swipeable-views";
import virtualize from "./virtualizeWithChildren";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./styles.css";
import Comment from "./Comment";
import { buildCommentsMap, loadComments2 } from "./utils";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

const styles = {
  slideContainer: {
    width: "calc(100% - 20px)",
  },
};

export function SwipeableComments({ comments }) {
  const commentMap = {};
  const [hashIndex, setHashIndex] = useState({});
  const [displayedComments, setDisplayedComments] = useState([]);
  const [allCommentsMap, setAllCommentsMap] = useState({});
  const [moreCommentsMap, setMoreCommentsMap] = useState({});
  const [moreCommentRepliesMap, setMoreCommentRepliesMap] = useState({});

  useEffect(() => {
    const { allCommentsMap: am, moreCommentsMap: mcm, targetComments, moreCommentRepliesMap: mcrm } =
      buildCommentsMap(comments, 5, 3);
    const parentId = "";
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
    const newComments = loadComments2(allCommentsMap, id, 3);
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
