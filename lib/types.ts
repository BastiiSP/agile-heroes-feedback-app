// Gemeinsame Typen für das Feedback-Datenmodell.

import type { RatingId, OpenQuestionId } from "./constants";

export type Ratings = Record<RatingId, number>;
export type FollowUps = Record<RatingId, string>;
export type OpenAnswers = Record<OpenQuestionId, string>;

// Was beim Absenden vom Client an /api/feedback geht und ans Apps Script
// weitergereicht wird.
export interface FeedbackEntry {
  id: number;
  ausbildung: string;
  module: string;
  trainer: string;
  name: string;
  ratings: Ratings;
  followUps: FollowUps;
  openAnswers: OpenAnswers;
  timestamp: string;
}

// Was der Trainer-Bereich aus dem Sheet geladen anzeigt.
export interface FeedbackItem {
  id: number;
  ausbildung: string;
  module: string;
  trainer: string;
  name: string;
  timestamp: string;
  ratings: Ratings;
  followUps: FollowUps;
  openAnswers: OpenAnswers;
}
