import { getAreasByStateLGA, getLGAsByState, getStates, searchLocations } from "@/utils/location-utils";
import { setPreferenceLocationResolver } from "@/lib/preference-shared/location-resolver";

setPreferenceLocationResolver({
  getLGAsByState,
  getAreasByLGA: getAreasByStateLGA,
  getAllStates: getStates,
  searchLocations,
});

export * from "@/lib/preference-shared/preference-ai-conversation";
export {
  applySmartLocationFromNaturalText,
  correctTranscriptionLocationTypos,
  filterLocationToUserMentionedOnly,
  sanitizeConversationLocation,
  userTextMentionsPhrase,
} from "@/lib/preference-shared/location-intelligence";
