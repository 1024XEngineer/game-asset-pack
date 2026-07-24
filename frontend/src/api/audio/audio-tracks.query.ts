import { queryOptions, useQuery } from "@tanstack/react-query";

import { audioApi } from "@/api/audio/audio.api";
import { audioKeys } from "@/api/audio/audio.keys";

export function audioTracksQueryOptions() {
  return queryOptions({
    queryKey: audioKeys.tracks(),
    queryFn: audioApi.listTracks,
  });
}

export function useAudioTracksQuery() {
  return useQuery(audioTracksQueryOptions());
}
