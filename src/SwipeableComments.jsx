import React, { useState } from 'react'
import SwipeableViews from 'react-swipeable-views'

import virtualize from './virtualizeWithChildren'
import Comment from './Comment'
import { useLazyLoadedComments } from './utils'

import './styles.css'

const VirtualizeSwipeableViews = virtualize(SwipeableViews)

const styles = {
  slideContainer: {
    width: 'calc(100% - 20px)',
  },
}

function SwipeableComments({
  comments,
  renderComment,
  renderRightArrow,
  renderLeftArrow,
  valueMap: valueMapExternal,
  setValueMap: setValueMapExternal,
}) {
  const commentMap = {}
  const [valueMapInternal, setValueMapInternal] = useState({})

  const controlled = valueMapExternal && setValueMapExternal

  let valueMap = valueMapInternal
  let setValueMap = setValueMapInternal
  if (controlled) {
    valueMap = valueMapExternal
    setValueMap = setValueMapExternal
  }

  const {
    displayedComments,
    loadChildComments,
    loadSiblingComments,
    moreCommentsMap,
    moreCommentRepliesMap,
  } = useLazyLoadedComments(comments)

  const _setValueMap = (id, index) => {
    setValueMap({ ...valueMap, [id]: index })
  }

  const commentTree = (parentId, level, parentVisible) => {
    const currentIndex = valueMap[parentId] || 0

    let commentsAtThisLevel = commentMap[parentId]
    if (!commentsAtThisLevel) {
      commentsAtThisLevel = displayedComments.filter(
        (c) => c.parentId === parentId,
      )
      commentMap[parentId] = commentsAtThisLevel
    }
    const currentId = commentsAtThisLevel[currentIndex]?.id

    const commentsDivs = commentsAtThisLevel.map((comment, i) => (
      <Comment
        renderComment={() => renderComment(comment)}
        key={comment.id}
        id={comment.id}
        level={level}
        moreCommentRepliesMap={moreCommentRepliesMap[comment.id]}
        isLastVisibleComment={
          displayedComments.filter((c) => c.parentId === comment.id).length ===
          0
        }
        getMoreReplies={loadChildComments}
        displayChildren={i + 2 > currentIndex && i - 2 < currentIndex}
      >
        {commentTree(
          comment.id,
          level + 1,
          parentVisible && i === currentIndex,
        )}
      </Comment>
    ))

    return (
      commentsDivs.length > 0 && (
        <div className="children-comments">
          {commentsAtThisLevel.length > 1 ? (
            <div className="comment-header">
              <button
                onClick={() => {
                  const newIndex = (valueMap[parentId] || 1) - 1
                  _setValueMap(parentId, newIndex)
                }}
                className={currentIndex === 0 ? 'disabled' : 'enabled'}
                disabled={currentIndex === 0}
              >
                {renderLeftArrow ? renderLeftArrow() : '<'}
              </button>
              <div className="comment-number">
                {currentIndex + 1} of {commentsAtThisLevel.length}
              </div>

              <input
                type="range"
                min="1"
                max={commentsAtThisLevel.length}
                value={currentIndex + 1}
                onMouseDown={() => console.log('test click')}
                onChange={(e) => _setValueMap(parentId, e.target.value - 1)}
                className="slider"
                id="myRange"
              />

              <button
                onClick={() => {
                  const newIndex = (valueMap[parentId] || 0) + 1
                  if (newIndex < commentsAtThisLevel.length) {
                    _setValueMap(parentId, newIndex)
                  }
                }}
                className={
                  currentIndex === commentsAtThisLevel.length - 1
                    ? 'disabled'
                    : 'enabled'
                }
              >
                {renderRightArrow ? renderRightArrow() : '>'}
              </button>
              {moreCommentsMap[currentId] &&
                currentIndex === commentsAtThisLevel.length - 1 && (
                  <button
                    className="loadMoreComments"
                    onClick={() =>
                      loadSiblingComments(
                        parentId,
                        moreCommentsMap[currentId].indexOfNextComments,
                      )
                    }
                  >
                    {moreCommentsMap[currentId].toLoad} more...
                  </button>
                )}
            </div>
          ) : (
            <div className="spacer" />
          )}

          <VirtualizeSwipeableViews
            containerStyle={{ flexGrow: 1 }}
            onChangeIndex={(i) => {
              _setValueMap(parentId, i)
            }}
            index={valueMap[parentId] || 0}
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
    )
  }

  return <div className="swipeable-comments">{commentTree('', 0, true)}</div>
}

export default SwipeableComments
