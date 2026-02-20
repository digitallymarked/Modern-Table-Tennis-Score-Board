export type ScoreObject = {
  leftPlayerScore: number
  leftPlayerMatchScore: number
  rightPlayerScore: number
  rightPlayerMatchScore: number
  whoServeFirst: 'left' | 'right'
  freeText: string
  leftPlayerName?: string
  rightPlayerName?: string
}

export const defaultScore: ScoreObject = {
  leftPlayerScore: 0,
  leftPlayerMatchScore: 0,
  rightPlayerScore: 0,
  rightPlayerMatchScore: 0,
  whoServeFirst: 'left',
  freeText: '',
  leftPlayerName: '',
  rightPlayerName: '',
}
