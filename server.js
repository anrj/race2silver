import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

app.use(express.static('src'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// get puuid with gameName and tagLine
app.get('/puuid/:gameName/:tagLine', async (req, res) => {
  try {
    const { gameName, tagLine } = req.params;
    const response = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } },
    );
    res.json(response.data);
  }
  catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// get summoner with puuid
app.get('/summoner/:puuid', async (req, res) => {
  try {
    const { puuid } = req.params;
    const response = await axios.get(
      `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } },
    );
    res.json(response.data);
  }
  catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// get rank with summonerId
app.get('/rank/:summonerId', async (req, res) => {
  try {
    const { summonerId } = req.params;
    const response = await axios.get(
      `https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } },
    );
    const rankData = response.data.find(
      (entry) => entry.queueType === 'RANKED_SOLO_5x5',
    ) || { tier: 'Unranked', rank: '', leaguePoints: 0, wins: 0, losses: 0 };

    res.json(rankData);
  }
  catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/match-history/:puuid', async (req, res) => {
  try {
    const { puuid, count } = req.params;
    const response = await axios.get(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } },
    );
    res.json(response.data);
  }
  catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
