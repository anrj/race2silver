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
    return rankData ? rankData.tier + ' ' + rankData.rank : 'Unranked';
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

async function main() {
  const body = await getPUUID('Elegy', 'EUNE');
  const puuid = body.puuid;
  const summonerId = await getSummonerId(puuid);
  const rank = await getRank(summonerId);
  const matches = await getMatchHistory(puuid, 1);
  console.log('Rank:', rank);
  for (const match of matches) {
    const matchDetails = await getMatchDetails(match);
    // console.log('Match Details:', JSON.stringify(matchDetails, null, 2));
    console.log('Match Details:', matchDetails);
  }
}

main().catch(console.error);
