// src/posts/guards/is-populated-profile.guard.ts

import { ProfileDocument } from '../../profile/schemas/profile.schema';
import { Types } from 'mongoose';

export function isPopulatedProfile(
  author: Types.ObjectId | ProfileDocument,
): author is ProfileDocument {
  return author && (author as ProfileDocument).username !== undefined;
}
