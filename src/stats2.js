const API_BASE_URL = 'http://localhost:3000';

async function fetchPUUID(gameName, tagLine) {
  const puuidResponse = await fetch(
    `${API_BASE_URL}/puuid/${gameName}/${tagLine}`,
  );
  const puuidData = await puuidResponse.json();
  if (!puuidData || puuidData.error) throw new Error('Failed to fetch PUUID');
  return puuidData;
}

async function fetchPlayerData(gameName, tagLine) {
  // Get PUUID
  const puuidData = await fetchPUUID(gameName, tagLine);

  // Get Summoner ID
  const summonerResponse = await fetch(
    `${API_BASE_URL}/summoner/${puuidData.puuid}`,
  );
  const summonerData = await summonerResponse.json();
  if (!summonerData || summonerData.error) {
    throw new Error('Failed to fetch summoner data');
  }

  // Get Rank
  const rankResponse = await fetch(`${API_BASE_URL}/rank/${summonerData.id}`);
  const rankData = await rankResponse.json();
  if (!rankData) throw new Error('Failed to fetch rank data');

  return formatRankData(rankData);
}

function formatRankData(rankData) {
  const tier = rankData.tier || 'Unranked';
  const formattedTier =
    tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();

  return {
    rank:
      tier === 'Unranked' ? 'Unranked' : `${formattedTier} ${rankData.rank}`,
    rankTier: formattedTier,
    lp: rankData.leaguePoints || 0,
  };
}

export async function fetchStats() {
  try {
    const [gogicha, khela] = await Promise.all([
      fetchPlayerData('Elegy', 'EUNE'),
      fetchPlayerData('khela1', 'EUNE'),
    ]);

    return { gogicha, khela };
  }
  catch (error) {
    console.error('Error fetching stats:', error);
    return {
      gogicha: { rank: 'Unranked', rankTier: 'Unranked', lp: 0 },
      khela: { rank: 'Unranked', rankTier: 'Unranked', lp: 0 },
    };
  }
}

async function fetchMatchHistory(gameName, tagLine, count) {
  const puuidResponse = await fetchPUUID(gameName, tagLine);
  const puuid = puuidResponse.puuid;
  const matchHistoryResponse = await fetch(`${API_BASE_URL}/match-history/${puuid}/${count}`);
  const matchHistoryIDs = await matchHistoryResponse.json();
  if (!matchHistoryIDs || matchHistoryIDs.error) {
    throw new Error('Failed to fetch match history');
  }

  return matchHistoryIDs;
}

async function fetchMatchData(matchId) {
  const matchResponse = await fetch(`${API_BASE_URL}/match/${matchId}`);
  const matchData = await matchResponse.json();
  if (!matchData || matchData.error) {
    throw new Error('Failed to fetch match data');
  }

  return getMatchDataDetails(matchData, 'Elegy', 'EUNE');
}

async function getMatchDataDetails(matchData, gameName, tagLine) {
  const isRankedSoloDuo = matchData.info.queueId === 420; // predicate to implement getting last 5 ranked games
  const gameId = matchData.info.gameId;

  let participant = null;
  for (let i = 0; i < matchData.info.participants.length; i++) {
    const currentParticipant = matchData.info.participants[i];
    if (currentParticipant.riotIdGameName === gameName && currentParticipant.riotIdTagline === tagLine) {
      participant = currentParticipant;
      break;
    }
  }

  const isRemake = matchData.info.gameDuration < 300;


  return {
    gameId,
    isRankedSoloDuo,
    participantId: participant?.participantId,
    isWin: participant?.win,
    isRemake,
  };
}

export async function getLast5RankedGames(gameName, tagLine) {
  const matchIds = await fetchMatchHistory(gameName, tagLine, 8);
  const games = await Promise.all(matchIds.map(fetchMatchData));
  const rankedGames = games.filter((game) => game.isRankedSoloDuo);
  return rankedGames.slice(0, 5);
}