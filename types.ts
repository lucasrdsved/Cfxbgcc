
export interface SongData {
  title: string;
  artist: string;
  vibrationPattern: number[]; // Array of milliseconds: [vibrate, pause, vibrate, pause...]
  options: string[]; // List of 4 song titles (one correct, 3 decoys)
}

export enum GameState {
  LOBBY = 'LOBBY',
  SELECTING = 'SELECTING',
  PASSING = 'PASSING',
  FEELING = 'FEELING',
  GUESSING = 'GUESSING',
  RESULT = 'RESULT'
}

export type PlayerRole = 'PICKER' | 'GUESSER';

export interface GameSession {
  mode: 'SOLO' | 'VS';
  currentSong?: SongData;
  score: number;
  attempts: number;
}
