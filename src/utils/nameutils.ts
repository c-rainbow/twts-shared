

const asciiNamePattern = /[a-zA-Z_]/;


/**
 * 
 * @param displayName Twitch display name
 * @returns true if the display name is localized (non-ascii)
 */
export function isLocalizedName(displayName: string): boolean {
  return !asciiNamePattern.test(displayName);
}