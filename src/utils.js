import { useEffect, useState } from 'react'

export function useLazyLoadedComments(comments, maxLevel = 20, maxDepth = 20) {
  const [displayedComments, setDisplayedComments] = useState([])
  const [allCommentsMap, setAllCommentsMap] = useState({})
  const [moreCommentsMap, setMoreCommentsMap] = useState({})
  const [moreCommentRepliesMap, setMoreCommentRepliesMap] = useState({})

  useEffect(() => {
    const {
      allCommentsMap: am,
      moreCommentsMap: mcm,
      targetComments,
      moreCommentRepliesMap: mcrm,
    } = buildCommentsMap(comments, maxLevel, maxDepth)
    const parentId = ''
    setAllCommentsMap(am)
    setMoreCommentsMap(mcm)
    setDisplayedComments(targetComments)
    setMoreCommentRepliesMap(mcrm)
  }, [comments])

  function loadSiblingComments(parentId, indexOfNextComments) {
    console.log('loading more comments')
    setDisplayedComments([
      ...displayedComments,
      ...allCommentsMap[parentId][indexOfNextComments],
    ])
  }

  function loadChildComments(id) {
    console.log('loading more replies: ', id)
    const newComments = loadComments2(allCommentsMap, id, maxDepth)
    setDisplayedComments([...displayedComments, ...newComments])
  }

  return {
    displayedComments,
    loadSiblingComments,
    loadChildComments,
    moreCommentsMap,
    moreCommentRepliesMap,
  }
}

function buildCommentsMap(sourceComments, maxLvl, maxDepth) {
  const levelCountMap = {}
  const allCommentsMap = {}
  const moreCommentsMap = {}
  sourceComments.forEach((c) => {
    levelCountMap[c.parentId] = (levelCountMap[c.parentId] || 0) + 1
    const level = Math.floor((levelCountMap[c.parentId] - 1) / maxLvl)

    // TODO: Separate setting the moreCommentsMap
    if ((levelCountMap[c.parentId] % maxLvl) / maxLvl === 0) {
      const totalAtLevel = sourceComments.filter(
        (c2) => c2.parentId === c.parentId,
      ).length
      const currentCount = (level + 1) * maxLvl
      const remainingAtLevel = totalAtLevel - currentCount
      if (remainingAtLevel !== 0) {
        const toLoad = remainingAtLevel > maxLvl ? maxLvl : remainingAtLevel
        moreCommentsMap[c.id] = {
          indexOfNextComments: level + 1,
          toLoad,
        }
      }
    }

    if (!allCommentsMap[c.parentId]) {
      allCommentsMap[c.parentId] = []
    }
    if (!allCommentsMap[c.parentId][level]) {
      allCommentsMap[c.parentId][level] = []
    }
    allCommentsMap[c.parentId][level].push(c)
  })

  const targetComments = loadComments2(allCommentsMap, '', maxDepth)
  const moreCommentRepliesMap = {}

  function getChildrenDepth(comment) {
    if (allCommentsMap[comment.id]) {
      return (
        1 + getChildrenDepth(allCommentsMap, allCommentsMap[comment.id][0][0])
      )
    }
    return 0
  }

  function loadCommentsRecursive(sourceComments, level) {
    sourceComments.forEach((c) => {
      if (allCommentsMap[c.id]) {
        if (level < maxDepth - 1) {
          loadCommentsRecursive(allCommentsMap[c.id][0], level + 1)
        } else if (level === maxDepth - 1) {
          moreCommentRepliesMap[c.id] = {
            indexOfNextComments: level + 1,
            numOfChildren: getChildrenDepth(c),
          }
          loadCommentsRecursive(allCommentsMap[c.id][0], 0)
        }
      }
    })
  }

  const rootComment = allCommentsMap?.['']?.[0]
  if (!!rootComment) {
    loadCommentsRecursive(rootComment, 0)
  }

  return {
    allCommentsMap,
    moreCommentsMap,
    targetComments,
    moreCommentRepliesMap,
  }
}

function loadComments2(allCommentsMap, id, maxDepth) {
  const targetComments = []

  function loadCommentsRecursive2(sourceComments, level, addComment) {
    sourceComments.forEach((c) => {
      if (addComment) {
        targetComments.push(c)
      }
      if (allCommentsMap[c.id]) {
        const levelMatch = level === maxDepth - 1
        loadCommentsRecursive2(
          allCommentsMap[c.id][0],
          levelMatch ? 0 : level + 1,
          levelMatch ? false : addComment,
        )
      }
    })
  }

  const rootComment = allCommentsMap?.[id]?.[0]
  if (!!rootComment) {
    loadCommentsRecursive2(rootComment, 0, true)
  }
  return targetComments
}
