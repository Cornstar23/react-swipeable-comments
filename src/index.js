import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { SwipeableComments } from "./SwipeableComments.js";
import { loadRedditComments } from "./data/redditParser.js";

const allComments = require("./data/comments.json");

function App() {
  const [comments, setComments] = useState([]);
  
  useEffect(() => {
    const test = async () => {
      const c = await loadRedditComments();
      setComments(c.commentList);
    };
    test();
    // setComments(allComments);
  }, []);


  return (
      <SwipeableComments
        comments={comments}
      />
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
