const Comment = ({
  renderComment,
  id,
  level,
  moreCommentRepliesMap,
  isLastVisibleComment,
  getMoreReplies,
  displayChildren,
  style,
  children,
}) => {
  let commentClass = level === 0 ? ' comment-top' : ''
  if (children === false) {
    commentClass += ' comment-bottom'
  }
  return (
    <div className="comments" style={style}>
      <div className={`${commentClass} comment comment-body`}>
        {renderComment()}
      </div>
      {isLastVisibleComment && moreCommentRepliesMap && (
        <div className="loadMoreRepliesDiv">
          <button
            className="loadMoreComments"
            onClick={() =>
              getMoreReplies(
                id,
                moreCommentRepliesMap.indexOfNextComments,
                moreCommentRepliesMap.maxDepth,
              )
            }
          >
            {moreCommentRepliesMap.numOfChildren} more replies...
          </button>
        </div>
      )}
      {displayChildren && children}
    </div>
  )
}

export default Comment
