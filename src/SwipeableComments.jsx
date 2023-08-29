/* eslint-disable react/prop-types */
import React, { useState } from 'react'

import virtualize from './virtualizeWithChildren'
import Comment from './Comment'
import { useLazyLoadedComments } from './utils'

import './styles.css'
import SwipeableViews from './SwipeableViews'

const VirtualizeSwipeableViews = virtualize(SwipeableViews)

const styles = {
  slideContainer: {
    width: 'calc(100% - 0px)',
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
  const [isMouseDown, setIsMouseDown] = useState(false)

  const controlled = valueMapExternal && setValueMapExternal

  let valueMap = valueMapInternal
  let setValueMap = setValueMapInternal
  if (controlled) {
    valueMap = valueMapExternal
    setValueMap = setValueMapExternal
  }

  const { displayedComments, loadChildComments, loadSiblingComments, moreCommentsMap, moreCommentRepliesMap } =
    useLazyLoadedComments(comments)

  const _setValueMap = (parentId, commentId) => {
    setValueMap((prevMap) => ({ ...prevMap, [parentId]: commentId }))
  }

  const commentTree = (parentId, level, parentVisible) => {
    const currentId = valueMap[parentId]

    let commentsAtThisLevel = commentMap[parentId]
    if (!commentsAtThisLevel) {
      commentsAtThisLevel = displayedComments.filter((c) => c.parentId === parentId)
      commentMap[parentId] = commentsAtThisLevel
    }
    const currentComment = commentsAtThisLevel.find((c) => c.id === currentId)
    let currentIndex = commentsAtThisLevel.indexOf(currentComment)
    currentIndex = currentIndex < 0 ? 0 : currentIndex

    const commentsDivs = commentsAtThisLevel.map((comment, i) => (
      <Comment
        renderComment={() =>
          renderComment({
            ...comment,
            hasChildren: !!commentMap[comment.id].length,
          })
        }
        key={comment.id}
        id={comment.id}
        level={level}
        moreCommentRepliesMap={moreCommentRepliesMap[comment.id]}
        isLastVisibleComment={displayedComments.filter((c) => c.parentId === comment.id).length === 0}
        getMoreReplies={loadChildComments}
        displayChildren={i + 2 > currentIndex && i - 2 < currentIndex}
      >
        {commentTree(comment.id, level + 1, parentVisible && i === currentIndex)}
      </Comment>
    ))

    const chosenLeftArrow = renderLeftArrow ? renderLeftArrow() : <button>{'<'}</button>
    const chosenRightArrow = renderRightArrow ? renderRightArrow() : <button>{'>'}</button>

    return (
      commentsDivs.length > 0 && (
        <div className="children-comments">
          {commentsAtThisLevel.length > 1 ? (
            <div className="comment-header">
              <React.Fragment>
                {React.cloneElement(chosenLeftArrow, {
                  onClick: () => {
                    const previousComment = commentsAtThisLevel[currentIndex - 1]
                    if (previousComment) {
                      _setValueMap(parentId, previousComment.id)
                    }
                  },
                  className: currentIndex === 0 ? 'disabled' : 'enabled',
                  disabled: currentIndex === 0,
                })}
              </React.Fragment>
              <div className="comment-number">
                {currentIndex + 1} of {commentsAtThisLevel.length}
              </div>

              <input
                type="range"
                min="1"
                max={commentsAtThisLevel.length}
                value={currentIndex + 1}
                onTouchStart={() => setIsMouseDown(true)}
                onTouchEnd={() => setIsMouseDown(false)}
                onMouseDown={() => setIsMouseDown(true)}
                onMouseUp={() => setIsMouseDown(false)}
                onChange={(e) => {
                  const newIndex = e.target.value - 1
                  const selectedComment = commentsAtThisLevel[newIndex]
                  if (selectedComment) {
                    _setValueMap(parentId, selectedComment.id)
                  }
                }}
                className="slider"
                id="myRange"
              />
              <React.Fragment>
                {React.cloneElement(chosenRightArrow, {
                  onClick: () => {
                    const nextComment = commentsAtThisLevel[currentIndex + 1]
                    if (nextComment) {
                      _setValueMap(parentId, nextComment.id)
                    }
                  },
                  className: currentIndex === commentsAtThisLevel.length - 1 ? 'disabled' : 'enabled',
                })}
              </React.Fragment>
              {moreCommentsMap[currentId] && currentIndex === commentsAtThisLevel.length - 1 && (
                <button
                  className="loadMoreComments"
                  onClick={() => loadSiblingComments(parentId, moreCommentsMap[currentId].indexOfNextComments)}
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
            onChangeIndex={(newIndex) => {
              const selectedComment = commentsAtThisLevel[newIndex]
              if (selectedComment) {
                _setValueMap(parentId, selectedComment.id)
              }
            }}
            index={currentIndex}
            slideCount={commentsDivs.length}
            overscanSlideBefore={2}
            overscanSlideAfter={2}
            slideStyle={level === 0 ? styles.slideContainer : null}
            resistance
            className="swipeable-views"
            enableMouseEvents={!isMouseDown}
            disabled={isMouseDown}
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
