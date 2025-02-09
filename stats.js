require('dotenv').config();
const axios = require('axios');

async function getSummonerId(puuid) {
  try {
    const response = await axios.get(
      `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY,
        },
      },
    );
    return response.data.id;
  }
  catch (error) {
    if (error.response) {
      console.error('Error fetching summoner ID:', error.response.data);
    }
    else {
      console.error('Error fetching summoner ID:', error.message);
    }
    throw error;
  }
}

async function getRank(summonerId) {
  try {
    const response = await axios.get(
      `https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY,
        },
      },
    );
    const rankData = response.data.find(
      (entry) => entry.queueType === 'RANKED_SOLO_5x5',
    );

    if (!rankData) {
      return { tier: 'Unranked', rank: '', leaguePoints: 0, wins: 0, losses: 0 };
    }

    return {
      tier: rankData.tier,
      rank: rankData.rank,
      leaguePoints: rankData.leaguePoints,
      wins: rankData.wins,
      losses: rankData.losses,
    };
  }
  catch (error) {
    if (error.response) {
      console.error('Error fetching rank:', error.response.data);
    }
    else {
      console.error('Error fetching rank:', error.message);
    }
    throw error;
  }
}

async function getPUUID(gameName, tagLine) {
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY,
        },
      },
    );
    return response.data;
  }
  catch (error) {
    if (error.response) {
      console.error('Error fetching PUUID:', error.response.data);
    }
    else {
      console.error('Error fetching PUUID:', error.message);
    }
    throw error;
  }
}

async function getMatchHistory(puuid, count = 20) {
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY,
        },
      },
    );
    return response.data;
  }
  catch (error) {
    if (error.response) {
      console.error('Error fetching match history:', error.response.data);
    }
    else {
      console.error('Error fetching match history:', error.message);
    }
    throw error;
  }
}

async function getMatchDetails(matchId) {
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY,
        },
      },
    );
    return response.data;
  }
  catch (error) {
    if (error.response) {
      console.error('Error fetching match details:', error.response.data);
    }
    else {
      console.error('Error fetching match details:', error.message);
    }
    throw error;
  }
}


async function fetchStats() {
  const gogicha = await getPUUID('Elegy', 'EUNE');
  const khela = await getPUUID('khela1', 'EUNE');

  const gogichaSummonerId = await getSummonerId(gogicha.puuid);
  const khelaSummonerId = await getSummonerId(khela.puuid);

  const gogichaRank = await getRank(gogichaSummonerId);
  const khelaRank = await getRank(khelaSummonerId);

  const gogichaRankTier = gogichaRank.tier.charAt(0).toUpperCase() + gogichaRank.tier.slice(1).toLowerCase();
  const gogichaRankDivision = gogichaRank.rank;
  const gogichaLP = gogichaRank.leaguePoints;

  const khelaRankTier = khelaRank.tier.charAt(0).toUpperCase() + khelaRank.tier.slice(1).toLowerCase();
  const khelaRankDivision = khelaRank.rank;
  const khelaLP = khelaRank.leaguePoints;

  return {
    gogicha: {
      rank: `${gogichaRankTier} ${gogichaRankDivision}`,
      lp: gogichaLP,
    },
    khela: {
      rank: `${khelaRankTier} ${khelaRankDivision}`,
      lp: khelaLP,
    },
  };
}

export { fetchStats };