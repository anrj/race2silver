const API_BASE_URL = 'http://localhost:3000';

async function fetchPlayerData(gameName, tagLine) {
  // Get PUUID
  const puuidResponse = await fetch(`${API_BASE_URL}/puuid/${gameName}/${tagLine}`);
  const puuidData = await puuidResponse.json();
  if (!puuidData || puuidData.error) throw new Error('Failed to fetch PUUID');

  // Get Summoner ID
  const summonerResponse = await fetch(`${API_BASE_URL}/summoner/${puuidData.puuid}`);
  const summonerData = await summonerResponse.json();
  if (!summonerData || summonerData.error) throw new Error('Failed to fetch summoner data');

  // Get Rank
  const rankResponse = await fetch(`${API_BASE_URL}/rank/${summonerData.id}`);
  const rankData = await rankResponse.json();
  if (!rankData) throw new Error('Failed to fetch rank data');

  return formatRankData(rankData);
}

function formatRankData(rankData) {
  const tier = rankData.tier || 'Unranked';
  const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();

  return {
    rank: tier === 'Unranked' ? 'Unranked' : `${formattedTier} ${rankData.rank}`,
    rankTier: formattedTier,
    lp: rankData.leaguePoints || 0,
  };
}

export async function fetchStats() {
  try {
    // Fetch data for both players in parallel
    const [gogicha, khela] = await Promise.all([
      fetchPlayerData('Elegy', 'EUNE'),
      fetchPlayerData('khela1', 'EUNE'),
    ]);

    return { gogicha, khela };
  }
  catch (error) {
    console.error('Error fetching stats:', error);
    // Return default values if there's an error
    return {
      gogicha: { rank: 'Unranked', rankTier: 'Unranked', lp: 0 },
      khela: { rank: 'Unranked', rankTier: 'Unranked', lp: 0 },
    };
  }

}