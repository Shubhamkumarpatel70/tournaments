import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tournamentAPI } from '../utils/api';
import api from '../utils/api';
import Button from '../components/Button';

const UpcomingMatches = () => {
  const { user } = useAuth();
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tournamentsResponse, schedulesResponse] = await Promise.all([
        tournamentAPI.getAll(),
        api.get("/match-schedules/my-matches").catch(() => ({ data: [] }))
      ]);

      // Get upcoming tournaments
      const upcomingTournaments = tournamentsResponse.data
        .filter(
          (t) => {
            const matchDate = new Date(t.matchDate || t.date);
            return matchDate > new Date() && (t.status === "upcoming" || t.status === "ongoing");
          }
        )
        .map(t => ({
          ...t,
          type: 'tournament',
          displayDate: new Date(t.matchDate || t.date)
        }));

      // Get match schedules
      const upcomingSchedules = schedulesResponse.data
        .filter(schedule => {
          const scheduleDate = new Date(schedule.matchDate);
          return scheduleDate > new Date();
        })
        .map(schedule => ({
          ...schedule,
          type: 'match',
          displayDate: new Date(schedule.matchDate),
          name: schedule.tournamentId?.name || 'Match',
          game: schedule.tournamentId?.game || schedule.gameType
        }));

      // Combine and sort by date
      const allUpcoming = [...upcomingTournaments, ...upcomingSchedules]
        .sort((a, b) => a.displayDate - b.displayDate);

      setUpcomingMatches(allUpcoming);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lava-black">
        <div className="text-lava-orange text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 neon-text-cyan">Upcoming Matches</h1>
          <p className="text-gray-400 text-sm sm:text-base">All your scheduled matches and tournaments</p>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="space-y-4">
            {upcomingMatches.map((item) => (
              <div
                key={item._id}
                className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 hover:border-lava-orange transition-all hover:shadow-lava-glow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-lava-orange text-lava-black px-3 py-1 rounded-full text-sm font-bold">
                        {item.game}
                      </span>
                      <h3 className="font-bold text-2xl">{item.name}</h3>
                      {item.type === 'match' && (
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                          Match Schedule
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">📅 Date & Time</p>
                        <p className="text-off-white font-semibold">
                          {new Date(item.displayDate || item.matchDate || item.date).toLocaleString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            }
                          )}
                        </p>
                      </div>
                      
                      {item.type === 'match' ? (
                        <>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">🎮 Game ID</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lava-orange font-mono font-bold">{item.gameId}</p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.gameId);
                                  alert("Game ID copied!");
                                }}
                                className="px-2 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">🔑 Password</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lava-orange font-mono font-bold">{item.password}</p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.password);
                                  alert("Password copied!");
                                }}
                                className="px-2 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">👥 Tournament Type</p>
                            <p className="text-off-white font-semibold">{item.tournamentType}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">💰 Prize Pool</p>
                            <p className="text-fiery-yellow font-bold text-xl">
                              ₹{item.prizePool?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">👥 Teams Registered</p>
                            <p className="text-off-white font-semibold">
                              {item.registeredTeams || 0}/{item.maxTeams || 'N/A'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {item.type === 'tournament' && (
                    <div className="text-center md:text-right">
                      <div className="text-fiery-yellow font-bold text-3xl mb-2">
                        ₹{item.prizePool?.toLocaleString()}
                      </div>
                      <Button variant="primary" className="w-full md:w-auto">
                         Join Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">No upcoming matches scheduled</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new matches</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingMatches;

