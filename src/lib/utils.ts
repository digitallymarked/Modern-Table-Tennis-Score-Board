import type { ScoreObject } from './types'

function isEven(i: number): boolean {
  return i % 2 === 0
}

export function determineWhoServe(playersScore: ScoreObject): 'left' | 'right' {
  const firstPlayerServe = playersScore.whoServeFirst === 'left'
  const totalScore = playersScore.leftPlayerScore + playersScore.rightPlayerScore
  const players: ['left' | 'right', 'left' | 'right'] = firstPlayerServe
    ? ['left', 'right']
    : ['right', 'left']

  if (playersScore.leftPlayerScore >= 10 && playersScore.rightPlayerScore >= 10) {
    // Deuce: alternate every point
    return totalScore % 2 === 0 ? players[0] : players[1]
  }

  // Normal: alternate every 2 points
  const finalScoreDetermine = isEven(totalScore) ? totalScore : totalScore - 1
  return finalScoreDetermine % 4 === 0 ? players[0] : players[1]
}

export function determineWhoWin(
  leftScore: number,
  rightScore: number,
): '< Left Win' | 'Right Win >' | '' {
  if (leftScore >= 10 && rightScore >= 10) {
    const diff = leftScore - rightScore
    if (diff >= 2) return '< Left Win'
    if (diff <= -2) return 'Right Win >'
    return ''
  }
  if (leftScore >= 11 && rightScore <= 10) return '< Left Win'
  if (rightScore >= 11 && leftScore <= 10) return 'Right Win >'
  return ''
}
