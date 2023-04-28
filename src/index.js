import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { SwipeableComments } from "./SwipeableComments.js";
import { loadRedditComments } from "./data/redditParser.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const allComments = require("./data/comments.json");

function App() {
  const [comments, setComments] = useState([]);
  const [hashIndex, setHashIndex] = useState({});
  
  useEffect(() => {
    // const test = async () => {
    //   const c = await loadRedditComments();
    //   setComments(c.commentList);
    // };
    // test();
    setComments(allComments);
  }, []);


  return (
      <SwipeableComments
        hashIndex={hashIndex}
        setHashIndex={setHashIndex}
        comments={comments}
        renderComment={(comment) => <div><b>{comment.author}</b>: {comment.text}</div>}
        renderLeftArrow={() => <FontAwesomeIcon icon={faArrowLeft} />}
        renderRightArrow={() => <FontAwesomeIcon icon={faArrowRight} />}
      />
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
