import React, { useState, useRef } from "react";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";
import ReactResizeDetector from "react-resize-detector";

const Comment = ({
  comment: { author, id, text },
  level,
  moreCommentRepliesMap,
  isLastVisibleComment,
  getMoreReplies,
  displayChildren,
  isVisible,
  style,
  children
}) => {
  const testRef = useRef(null);

  //const [hasScrolled, setHasScrolled] = useState(false);
  const elementRef = useRef();

  // useScrollPosition(
  //   ({ currPos }) => {
  //     setHasScrolled(!currPos);
  //     console.log("scroll");
  //   },
  //   [hasScrolled],
  //   elementRef
  // );
  // const [rect, ref] = useClientRect();
  const [topOfComment, setTopOfComment] = useState(0);
  // const [commentsRect, commentsRef] = useClientRect();

  const pStyle = {
    top: 100 - topOfComment < 0 ? 100 - topOfComment : 0
  };
  // const pStyle = {
  //   top: "0" //rect ? `calc(100% + ${topOfComment}px)` : "0"
  // };

  const onResize = (width, height) => {
    if (level === 0) {
      setTopOfComment(testRef.current.clientHeight);
      console.log(testRef.current.clientHeight, width, height);
    }
  };
  // let b = 0;
  // if (commentsRect) {
  //   b = commentsRect.top;
  //   if (isVisible) {
  //     console.log(commentsRect.height);
  //   }
  // }

  // const cStyle = {
  //   //height: !isVisible ? `calc(100vh - ${b}px)` : "auto"
  //   //height: `calc(100vh - ${b}px)`
  // };

  return (
    <ReactResizeDetector
      refreshMode={"throttle"}
      refreshRate={1000}
      handleWidth
      handleHeight
      onResize={(w, h) => onResize(w, h)}
    >
      <div
        className="comments"
        style={style}
        ref={elementRef}
        // style={cStyle} ref={commentsRef}
      >
        <div
          className={`${
            level === 0 ? " comment-top" : ""
          } comment comment-body`}
          ref={testRef}
          style={pStyle}
        >
          <b>{author}</b>: {text}
        </div>
        {isLastVisibleComment && moreCommentRepliesMap && (
          <div className="loadMoreRepliesDiv">
            <button
              className="loadMoreComments"
              onClick={() =>
                getMoreReplies(
                  id,
                  moreCommentRepliesMap.indexOfNextComments,
                  moreCommentRepliesMap.maxDepth
                )
              }
            >
              {moreCommentRepliesMap.numOfChildren} more replies...
            </button>
          </div>
        )}
        {displayChildren && children}
      </div>
    </ReactResizeDetector>
  );
};

// function useClientRect() {
//   const [rect, setRect] = useState(null);
//   const ref = useCallback(node => {
//     if (node !== null) {
//       setRect(node.getBoundingClientRect());
//     }
//   }, []);
//   return [rect, ref];
// }

export default Comment;
