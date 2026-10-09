// Stored in profile_settings.pending*ImageId instead of a file ID to ask for the
// live photo to be REMOVED. Users can't write `profiles` (where live photos
// live), so a removal goes through the same admin approval as a new photo.
export const REMOVE_IMAGE = '__remove__'
