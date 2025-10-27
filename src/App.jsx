import React, { useState, useMemo } from 'react';
import { Trophy, Upload, TrendingUp, CheckCircle, XCircle, Clock, FileText, User, Settings } from 'lucide-react';

const App = () => {
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activePlayer, setActivePlayer] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [lastScoreUpdate, setLastScoreUpdate] = useState(null);
  const [weekNumber, setWeekNumber] = useState('7');
  const [year, setYear] = useState('2025');
  const [seasonType, setSeasonType] = useState('2');
  const [espnApiUrl, setEspnApiUrl] = useState('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
  const [currentGistId, setCurrentGistId] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [weekHistory, setWeekHistory] = useState([]);
  
  // Get GitHub token from environment variable (secure)
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;

  // Load data from session storage on mount
  React.useEffect(() => {
    loadFromStorage();
  }, []);

  // Save data to session storage whenever state changes
  React.useEffect(() => {
    if (!isLoading) {
      saveToStorage('pickem-games', games);
    }
  }, [games, isLoading]);

  React.useEffect(() => {
    if (!isLoading) {
      saveToStorage('pickem-players', players);
    }
  }, [players, isLoading]);

  React.useEffect(() => {
    if (!isLoading && activePlayer !== null) {
      saveToStorage('pickem-active-player', activePlayer.toString());
    }
  }, [activePlayer, isLoading]);

  React.useEffect(() => {
    if (!isLoading) {
      saveToStorage('pickem-week', weekNumber);
    }
  }, [weekNumber, isLoading]);

  React.useEffect(() => {
    if (!isLoading) {
      saveToStorage('pickem-year', year);
    }
  }, [year, isLoading]);

  React.useEffect(() => {
    if (!isLoading) {
      saveToStorage('pickem-season-type', seasonType);
    }
  }, [seasonType, isLoading]);

  React.useEffect(() => {
    if (!isLoading) {
      saveToStorage('pickem-espn-api-url', espnApiUrl);
    }
  }, [espnApiUrl, isLoading]);

  React.useEffect(() => {
    if (!isLoading && currentGistId) {
      saveToStorage('pickem-gist-id', currentGistId);
    }
  }, [currentGistId, isLoading]);

  React.useEffect(() => {
    if (!isLoading && lastScoreUpdate) {
      saveToStorage('pickem-last-update', lastScoreUpdate.toISOString());
    }
  }, [lastScoreUpdate, isLoading]);

  const loadFromStorage = () => {
    try {
      // Load games
      const savedGames = sessionStorage.getItem('pickem-games');
      if (savedGames) {
        const loadedGames = JSON.parse(savedGames);
        setGames(loadedGames);
        setIsAdminMode(false);
      }

      // Load players
      const savedPlayers = sessionStorage.getItem('pickem-players');
      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      }

      // Load active player
      const savedActivePlayer = sessionStorage.getItem('pickem-active-player');
      if (savedActivePlayer) {
        setActivePlayer(parseInt(savedActivePlayer));
      }

      // Load week number
      const savedWeek = sessionStorage.getItem('pickem-week');
      if (savedWeek) {
        setWeekNumber(savedWeek);
      }

      // Load year
      const savedYear = sessionStorage.getItem('pickem-year');
      if (savedYear) {
        setYear(savedYear);
      }

      // Load season type
      const savedSeasonType = sessionStorage.getItem('pickem-season-type');
      if (savedSeasonType) {
        setSeasonType(savedSeasonType);
      }

      // Load ESPN API URL
      const savedEspnUrl = sessionStorage.getItem('pickem-espn-api-url');
      if (savedEspnUrl) {
        setEspnApiUrl(savedEspnUrl);
      }

      // Load current gist ID
      const savedGistId = sessionStorage.getItem('pickem-gist-id');
      if (savedGistId) {
        setCurrentGistId(savedGistId);
      }

      // Load last update
      const savedLastUpdate = sessionStorage.getItem('pickem-last-update');
      if (savedLastUpdate) {
        setLastScoreUpdate(new Date(savedLastUpdate));
      }

    } catch (error) {
      console.log('No previous data found or error loading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = (key, value) => {
    try {
      if (typeof value === 'object') {
        sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        sessionStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error saving to session storage:', error);
      // Handle storage quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.warn('Session storage quota exceeded. Clearing old data...');
        clearOldData();
        // Try saving again
        try {
          if (typeof value === 'object') {
            sessionStorage.setItem(key, JSON.stringify(value));
          } else {
            sessionStorage.setItem(key, value);
          }
        } catch (retryError) {
          console.error('Failed to save even after clearing old data:', retryError);
        }
      }
    }
  };

  const clearOldData = () => {
    // Clear non-essential data first
    const nonEssentialKeys = ['pickem-last-update'];
    nonEssentialKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
  };

  const clearAllData = () => {
    const keys = [
      'pickem-games',
      'pickem-players', 
      'pickem-active-player',
      'pickem-week',
      'pickem-year', 
      'pickem-season-type',
      'pickem-espn-api-url',
      'pickem-gist-id',
      'pickem-last-update'
    ];
    keys.forEach(key => sessionStorage.removeItem(key));
  };

  // GitHub Gist persistence functions
  const saveWeekToGist = async () => {
    if (!githubToken) {
      setUploadMessage('⚠️ GitHub token required for saving to cloud');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const weekData = {
        weekNumber,
        year,
        seasonType,
        games,
        players,
        leaderboard: leaderboard,
        lastScoreUpdate: lastScoreUpdate?.toISOString(),
        savedAt: new Date().toISOString()
      };

      const gistData = {
        description: `NFL Pick'em Week ${weekNumber} - ${year}`,
        public: false,
        files: {
          [`week-${weekNumber}-${year}.json`]: {
            content: JSON.stringify(weekData, null, 2)
          }
        }
      };

      let response;
      if (currentGistId) {
        // Update existing gist
        response = await fetch(`https://api.github.com/gists/${currentGistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        });
      } else {
        // Create new gist
        response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        });
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const result = await response.json();
      if (!currentGistId) {
        setCurrentGistId(result.id);
      }

      setUploadMessage('✓ Week saved to cloud successfully!');
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {
      console.error('Error saving to gist:', error);
      setUploadMessage(`❌ Error saving to cloud: ${error.message}`);
      setTimeout(() => setUploadMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const loadWeekFromGist = async (gistId) => {
    if (!githubToken) {
      setUploadMessage('⚠️ GitHub token required for loading from cloud');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const gist = await response.json();
      const fileName = Object.keys(gist.files)[0];
      const content = gist.files[fileName].content;
      const weekData = JSON.parse(content);

      // Load the data
      setGames(weekData.games || []);
      setPlayers(weekData.players || []);
      setWeekNumber(weekData.weekNumber || '1');
      setYear(weekData.year || '2025');
      setSeasonType(weekData.seasonType || '2');
      if (weekData.lastScoreUpdate) {
        setLastScoreUpdate(new Date(weekData.lastScoreUpdate));
      }
      setCurrentGistId(gistId);
      setIsAdminMode(false);

      setUploadMessage('✓ Week loaded from cloud successfully!');
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {
      console.error('Error loading from gist:', error);
      setUploadMessage(`❌ Error loading from cloud: ${error.message}`);
      setTimeout(() => setUploadMessage(''), 5000);
    }
  };

  const loadWeekHistory = async () => {
    if (!githubToken) return;

    try {
      const response = await fetch('https://api.github.com/gists', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const gists = await response.json();
      const pickemGists = gists
        .filter(gist => gist.description?.includes('NFL Pick\'em Week'))
        .map(gist => ({
          id: gist.id,
          description: gist.description,
          createdAt: gist.created_at,
          updatedAt: gist.updated_at
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setWeekHistory(pickemGists);
    } catch (error) {
      console.error('Error loading week history:', error);
    }
  };

  // Load week history when component mounts (if token is available)
  React.useEffect(() => {
    if (githubToken && !isLoading) {
      loadWeekHistory();
    }
  }, [isLoading]);

  const exportData = () => {
    const data = {
      games,
      players,
      activePlayer,
      weekNumber,
      year,
      seasonType,
      espnApiUrl,
      lastScoreUpdate: lastScoreUpdate?.toISOString(),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pickem-week${weekNumber}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (data.games && Array.isArray(data.games)) {
          setGames(data.games);
        }
        if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
        }
        if (data.activePlayer) {
          setActivePlayer(data.activePlayer);
        }
        if (data.weekNumber) {
          setWeekNumber(data.weekNumber);
        }
        if (data.year) {
          setYear(data.year);
        }
        if (data.seasonType) {
          setSeasonType(data.seasonType);
        }
        if (data.espnApiUrl) {
          setEspnApiUrl(data.espnApiUrl);
        }
        if (data.lastScoreUpdate) {
          setLastScoreUpdate(new Date(data.lastScoreUpdate));
        }
        
        setUploadMessage('✓ Data imported successfully!');
        setTimeout(() => setUploadMessage(''), 3000);
      } catch (error) {
        console.error('Error importing data:', error);
        setUploadMessage('❌ Error importing data. Please check file format.');
        setTimeout(() => setUploadMessage(''), 5000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const fetchLiveScores = async () => {
    if (games.length === 0) {
      setUploadMessage('Please upload a pick sheet first to set up games');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    setIsLoadingScores(true);
    try {
      const apiUrl = `${espnApiUrl}?dates=${year}&seasontype=${seasonType}&week=${weekNumber}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scores');
      }

      const data = await response.json();
      
      // Create a comprehensive team name mapping that works both ways
      const normalizeTeamName = (teamName) => {
        const teamMap = {
          // Map all variations to a canonical name
          'Steelers': 'Pittsburgh',
          'Pittsburgh Steelers': 'Pittsburgh',
          'Pittsburgh': 'Pittsburgh',
          'Bengals': 'Cincinnati',
          'Cincinnati Bengals': 'Cincinnati',
          'Cincinnati': 'Cincinnati',
          'Rams': 'LA Rams',
          'Los Angeles Rams': 'LA Rams',
          'LA Rams': 'LA Rams',
          'Jaguars': 'Jacksonville',
          'Jacksonville Jaguars': 'Jacksonville',
          'Jacksonville': 'Jacksonville',
          'Saints': 'New Orleans',
          'New Orleans Saints': 'New Orleans',
          'New Orleans': 'New Orleans',
          'Bears': 'Chicago',
          'Chicago Bears': 'Chicago',
          'Chicago': 'Chicago',
          'Dolphins': 'Miami',
          'Miami Dolphins': 'Miami',
          'Miami': 'Miami',
          'Browns': 'Cleveland',
          'Cleveland Browns': 'Cleveland',
          'Cleveland': 'Cleveland',
          'Patriots': 'New England',
          'New England Patriots': 'New England',
          'New England': 'New England',
          'Titans': 'Tennessee',
          'Tennessee Titans': 'Tennessee',
          'Tennessee': 'Tennessee',
          'Raiders': 'Las Vegas',
          'Las Vegas Raiders': 'Las Vegas',
          'Las Vegas': 'Las Vegas',
          'Chiefs': 'Kansas City',
          'Kansas City Chiefs': 'Kansas City',
          'Kansas City': 'Kansas City',
          'Eagles': 'Philadelphia',
          'Philadelphia Eagles': 'Philadelphia',
          'Philadelphia': 'Philadelphia',
          'Vikings': 'Minnesota',
          'Minnesota Vikings': 'Minnesota',
          'Minnesota': 'Minnesota',
          'Panthers': 'Carolina',
          'Carolina Panthers': 'Carolina',
          'Carolina': 'Carolina',
          'Jets': 'NY Jets',
          'New York Jets': 'NY Jets',
          'NY Jets': 'NY Jets',
          'Giants': 'NY Giants',
          'New York Giants': 'NY Giants',
          'NY Giants': 'NY Giants',
          'Broncos': 'Denver',
          'Denver Broncos': 'Denver',
          'Denver': 'Denver',
          'Colts': 'Indianapolis',
          'Indianapolis Colts': 'Indianapolis',
          'Indianapolis': 'Indianapolis',
          'Chargers': 'LA Chargers',
          'Los Angeles Chargers': 'LA Chargers',
          'LA Chargers': 'LA Chargers',
          'Commanders': 'Washington',
          'Washington Commanders': 'Washington',
          'Washington': 'Washington',
          'Cowboys': 'Dallas',
          'Dallas Cowboys': 'Dallas',
          'Dallas': 'Dallas',
          'Packers': 'Green Bay',
          'Green Bay Packers': 'Green Bay',
          'Green Bay': 'Green Bay',
          'Cardinals': 'Arizona',
          'Arizona Cardinals': 'Arizona',
          'Arizona': 'Arizona',
          'Falcons': 'Atlanta',
          'Atlanta Falcons': 'Atlanta',
          'Atlanta': 'Atlanta',
          '49ers': 'San Francisco',
          'San Francisco 49ers': 'San Francisco',
          'San Francisco': 'San Francisco',
          'Buccaneers': 'Tampa Bay',
          'Tampa Bay Buccaneers': 'Tampa Bay',
          'Tampa Bay': 'Tampa Bay',
          'Lions': 'Detroit',
          'Detroit Lions': 'Detroit',
          'Detroit': 'Detroit',
          'Texans': 'Houston',
          'Houston Texans': 'Houston',
          'Houston': 'Houston',
          'Seahawks': 'Seattle',
          'Seattle Seahawks': 'Seattle',
          'Seattle': 'Seattle',
          'Ravens': 'Baltimore',
          'Baltimore Ravens': 'Baltimore',
          'Baltimore': 'Baltimore',
          'Bills': 'Buffalo',
          'Buffalo Bills': 'Buffalo',
          'Buffalo': 'Buffalo'
        };
        
        return teamMap[teamName] || teamName;
      };

      const updatedGames = games.map(game => {
        const espnEvent = data.events?.find(event => {
          const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
          const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');
          
          const espnHomeName = normalizeTeamName(homeTeam.team.displayName);
          const espnAwayName = normalizeTeamName(awayTeam.team.displayName);
          const gameHomeName = normalizeTeamName(game.homeTeam);
          const gameAwayName = normalizeTeamName(game.awayTeam);
          
          const match = espnHomeName === gameHomeName && espnAwayName === gameAwayName;
          
          if (match) {
            console.log(`✓ Matched: ${game.awayTeam} @ ${game.homeTeam}`);
          }
          
          return match;
        });

        if (espnEvent) {
          const competition = espnEvent.competitions[0];
          const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
          const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
          
          const homeScore = parseInt(homeTeam.score) || 0;
          const awayScore = parseInt(awayTeam.score) || 0;
          
          const status = competition.status.type.name;
          
          if (status === 'STATUS_FINAL') {
            return {
              ...game,
              winner: homeScore > awayScore ? game.homeTeam : game.awayTeam,
              homeScore,
              awayScore,
              status: 'final'
            };
          } else if (status === 'STATUS_IN_PROGRESS') {
            return {
              ...game,
              winner: homeScore > awayScore ? game.homeTeam : (awayScore > homeScore ? game.awayTeam : null),
              homeScore,
              awayScore,
              status: 'in-progress'
            };
          } else if (status === 'STATUS_SCHEDULED') {
            return {
              ...game,
              winner: null,
              homeScore: 0,
              awayScore: 0,
              status: 'scheduled'
            };
          }
        } else {
          console.log(`✗ No match found for: ${game.awayTeam} @ ${game.homeTeam}`);
        }
        
        return game;
      });
      
      console.log('updatedGames: ' + JSON.stringify(updatedGames));
      setGames(updatedGames);
      setLastScoreUpdate(new Date());
      setUploadMessage('Scores updated from ESPN!');
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {
      console.error('Error fetching scores:', error);
      setUploadMessage('Error fetching scores from ESPN. Try manual admin updates.');
      setTimeout(() => setUploadMessage(''), 5000);
    } finally {
      setIsLoadingScores(false);
    }
  };

  const handleTextFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadMessage('Processing pick sheet...');

    try {
      const text = await file.text();
      
      console.log('File text:', text);

      // Extract week number
      const weekMatch = text.match(/WEEK\s+(\d+)/i);
      if (weekMatch) {
        setWeekNumber(weekMatch[1]);
      }

      // Parse games from the text file
      const parsedGames = [];
      const lines = text.split('\n');
      
      let gameId = 1;
      let currentDay = 'Sunday';

      // Day patterns to detect
      const dayPatterns = {
        'Thursday': /Thursday/i,
        'Friday': /Friday/i,
        'Saturday': /Saturday/i,
        'Sunday': /Sunday/i,
        'Monday': /Monday/i
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and headers
        if (!line || line.includes('PICK SHEET') || line.includes('TIME(ET)') || 
            line.includes('Byes:') || line.includes('Tiebreaker:') || 
            line.includes('Name') || line.includes('Total Correct') ||
            line.includes('PrintYour') || /^\d{4}$/.test(line)) {
          continue;
        }

        // Check if line is a day header
        let foundDay = false;
        for (const [day, pattern] of Object.entries(dayPatterns)) {
          if (pattern.test(line)) {
            currentDay = day;
            foundDay = true;
            break;
          }
        }
        
        if (foundDay) continue;

        // Match game patterns: "Team at/vs Team Time"
        const gamePatterns = [
          /^(.+?)\s+at\s+(.+?)\s+(\d+:\d+\s*[ap]m)$/i,
          /^(.+?)\s+vs\s+(.+?)\s+(\d+:\d+\s*[ap]m)$/i,
          /^(.+?)\s+@\s+(.+?)\s+(\d+:\d+\s*[ap]m)$/i
        ];

        for (const pattern of gamePatterns) {
          const match = line.match(pattern);
          if (match) {
            const awayTeam = match[1].trim();
            const homeTeam = match[2].trim();
            const time = match[3].trim();

            parsedGames.push({
              id: gameId++,
              awayTeam,
              homeTeam,
              day: currentDay,
              time,
              winner: null
            });
            break;
          }
        }
      }

      console.log('Parsed games:', parsedGames);

      if (parsedGames.length === 0) {
        setUploadMessage('⚠️ Could not parse games from file. Please check the format.');
        setTimeout(() => setUploadMessage(''), 5000);
        return;
      }

      setGames(parsedGames);
      setUploadMessage(`✓ Loaded ${parsedGames.length} games for Week ${weekNumber}`);
      setIsAdminMode(false);
      setTimeout(() => setUploadMessage(''), 3000);
      e.target.value = '';
    } catch (error) {
      console.error('File processing error:', error);
      setUploadMessage(`❌ Error processing file: ${error.message}`);
      setTimeout(() => setUploadMessage(''), 5000);
    }
  };

  const addPlayer = () => {
    const newPlayer = {
      id: players.length + 1,
      name: `Player ${players.length + 1}`,
      picks: {},
      tiebreaker: 0
    };
    setPlayers([...players, newPlayer]);
    setActivePlayer(newPlayer.id);
  };

  const updatePlayerName = (playerId, name) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, name } : p
    ));
  };

  const updatePick = (playerId, gameId, pick) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, picks: { ...p.picks, [gameId]: pick } } : p
    ));
  };

  const updateTiebreaker = (playerId, value) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, tiebreaker: parseInt(value) || 0 } : p
    ));
  };

  const updateGameWinner = (gameId, winner) => {
    setGames(games.map(g => 
      g.id === gameId ? { ...g, winner } : g
    ));
  };

  const leaderboard = useMemo(() => {
    return players.map(player => {
      let correct = 0;
      let incorrect = 0;
      let pending = 0;

      games.forEach(game => {
        const pick = player.picks[game.id];
        if (pick) {
          if (game.winner === null) {
            pending++;
          } else if (pick === game.winner) {
            correct++;
          } else {
            incorrect++;
          }
        }
      });

      return {
        ...player,
        correct,
        incorrect,
        pending,
        total: correct + incorrect + pending
      };
    }).sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      return a.incorrect - b.incorrect;
    });
  }, [players, games]);

  const currentPlayer = players.find(p => p.id === activePlayer);

  const getGameStatus = (game, pick) => {
    if (game.winner === null) {
      return pick ? 'pending' : 'not-picked';
    }
    if (!pick) return 'not-picked';
    return pick === game.winner ? 'correct' : 'incorrect';
  };

// Admin setup view
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">NFL Pick'em Setup</h1>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Admin Instructions:</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Upload the weekly pick sheet to set up games</li>
                  <li>Or restore a previous week from exported data</li>
                  <li>Add players and have them make picks through the web interface</li>
                  <li>Update scores automatically from ESPN or manually</li>
                  <li>Track scores and leaderboard in real-time</li>
                </ol>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Upload Pick Sheet
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload the blank weekly pick sheet to set up games
                </p>
                <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 inline mr-2" />
                  Choose Text File
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleTextFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Import Previous Data
                </h3>
                <p className="text-gray-600 mb-4">
                  Restore games and picks from an exported file
                </p>
                <label className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                  <FileText className="w-5 h-5 inline mr-2" />
                  Import JSON File
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Week Number
                    </label>
                    <input
                      type="number"
                      value={weekNumber}
                      onChange={(e) => setWeekNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Season Type
                    </label>
                    <select
                      value={seasonType}
                      onChange={(e) => setSeasonType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1">Preseason</option>
                      <option value="2">Regular Season</option>
                      <option value="3">Postseason</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ESPN API URL
                  </label>
                  <input
                    type="url"
                    value={espnApiUrl}
                    onChange={(e) => setEspnApiUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
                  />
                </div>
                {githubToken && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓ Cloud persistence enabled via environment configuration
                    </p>
                  </div>
                )}
              </div>

              {uploadMessage && (
                <div className={`p-3 rounded-lg ${
                  uploadMessage.includes('âœ"') ? 'bg-green-100 border border-green-400 text-green-700' :
                  uploadMessage.includes('âŒ') || uploadMessage.includes('âš ï¸') ? 'bg-red-100 border border-red-400 text-red-700' :
                  'bg-blue-100 border border-blue-400 text-blue-700'
                }`}>
                  {uploadMessage}
                </div>
              )}

              {githubToken && weekHistory.length > 0 && (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Previous Weeks (Cloud Storage)
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {weekHistory.map(week => (
                      <div key={week.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{week.description}</div>
                          <div className="text-sm text-gray-500">
                            Updated: {new Date(week.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => loadWeekFromGist(week.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          Load
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {games.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Data Management
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {githubToken && (
                      <button
                        onClick={saveWeekToGist}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving to Cloud...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Save to Cloud
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={exportData}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export Data
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('This will clear all data stored locally in your browser for this week. Continue?')) {
                          clearAllData();
                          setGames([]);
                          setPlayers([]);
                          setActivePlayer(null);
                          setCurrentGistId(null);
                          setUploadMessage('âœ" All data cleared');
                          setTimeout(() => setUploadMessage(''), 3000);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Clear All Local Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app view (after file is uploaded)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gray-800">NFL Pick'em Week {weekNumber}</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={fetchLiveScores}
                disabled={isLoadingScores}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingScores ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Update Scores
                  </>
                )}
              </button>
              {githubToken && (
                <button
                  onClick={saveWeekToGist}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Save to Cloud
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {showAdmin ? 'Hide' : 'Show'} Admin
              </button>
              <button
                onClick={() => setIsAdminMode(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                New Week
              </button>
              <button
                onClick={addPlayer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Add Player
              </button>
            </div>
          </div>

          {uploadMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {uploadMessage}
            </div>
          )}

          {lastScoreUpdate && (
            <div className="mt-4 text-sm text-gray-600">
              Last score update: {lastScoreUpdate.toLocaleTimeString()}
            </div>
          )}

          {/* Player Tabs */}
          {players.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {players.map(player => (
                <button
                  key={player.id}
                  onClick={() => setActivePlayer(player.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activePlayer === player.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {player.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {players.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Players Yet</h2>
            <p className="text-gray-600 mb-6">
              Add players to start making picks
            </p>
            <button
              onClick={addPlayer}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Player
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Picks Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Player Name Editor */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player Name
                </label>
                <input
                  type="text"
                  value={currentPlayer?.name || ''}
                  onChange={(e) => updatePlayerName(activePlayer, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Games by Day */}
              {['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'].map(day => {
                const dayGames = games.filter(g => g.day === day);
                if (dayGames.length === 0) return null;

                return (
                  <div key={day} className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{day}</h2>
                    <div className="space-y-3">
                      {dayGames.map(game => {
                        const pick = currentPlayer?.picks[game.id];
                        const status = getGameStatus(game, pick);

                        return (
                          <div
                            key={game.id}
                            className={`border-2 rounded-lg p-4 transition-all ${
                              status === 'correct' ? 'border-green-500 bg-green-50' :
                              status === 'incorrect' ? 'border-red-500 bg-red-50' :
                              status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
                              'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">{game.time}</span>
                              {status === 'correct' && <CheckCircle className="w-5 h-5 text-green-600" />}
                              {status === 'incorrect' && <XCircle className="w-5 h-5 text-red-600" />}
                              {status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => updatePick(activePlayer, game.id, game.awayTeam)}
                                disabled={game.winner !== null}
                                className={`p-3 rounded-lg font-medium transition-all ${
                                  pick === game.awayTeam
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${game.winner !== null ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                {game.awayTeam}
                                {game.winner === game.awayTeam && ' ✓'}
                              </button>
                              <button
                                onClick={() => updatePick(activePlayer, game.id, game.homeTeam)}
                                disabled={game.winner !== null}
                                className={`p-3 rounded-lg font-medium transition-all ${
                                  pick === game.homeTeam
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${game.winner !== null ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                {game.homeTeam}
                                {game.winner === game.homeTeam && ' ✓'}
                              </button>
                            </div>
                            {game.homeScore !== undefined && (
                              <div className="mt-2 text-center text-sm font-semibold text-gray-700">
                                {game.awayScore} - {game.homeScore}
                                {game.status === 'in-progress' && <span className="ml-2 text-yellow-600">(Live)</span>}
                                {game.status === 'final' && <span className="ml-2 text-green-600">(Final)</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Tiebreaker */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3">Tiebreaker</h3>
                <label className="block text-sm text-gray-600 mb-2">
                  Total points scored in both Monday Night Football games
                </label>
                <input
                  type="number"
                  value={currentPlayer?.tiebreaker || ''}
                  onChange={(e) => updateTiebreaker(activePlayer, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter total points"
                />
              </div>
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
                </div>
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index === 0 ? 'border-yellow-400 bg-yellow-50' :
                        index === 1 ? 'border-gray-400 bg-gray-50' :
                        index === 2 ? 'border-orange-400 bg-orange-50' :
                        'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                          <span className="font-semibold text-gray-800">{player.name}</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{player.correct}</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">✓ {player.correct}</span>
                        <span className="text-red-600">✗ {player.incorrect}</span>
                        <span className="text-yellow-600">⏳ {player.pending}</span>
                      </div>
                      {player.tiebreaker > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Tiebreaker: {player.tiebreaker}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {showAdmin && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin: Set Game Winners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map(game => (
                <div key={game.id} className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {game.day} {game.time}
                  </div>
                  <div className="text-sm font-medium mb-2">
                    {game.awayTeam} @ {game.homeTeam}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateGameWinner(game.id, game.homeTeam)}
                      className={`flex-1 px-3 py-2 rounded text-sm ${
                        game.winner === game.homeTeam
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {game.homeTeam}
                    </button>
                    <button
                      onClick={() => updateGameWinner(game.id, null)}
                      className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;