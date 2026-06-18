import requireHacker from 'require-hacker'
requireHacker.hook('css', () => 'module.exports = ""')

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { getAllAthletesLive, getAthleteRankLive } from './lib/server/repositories/athletes-live'
import { getAllEventsLive } from './lib/server/repositories/events-live'
import { getBranchCoachNameMapLive } from './lib/server/repositories/senseis-live'
import { buildRestoredAthleteProfileData } from './app/_components/athlete/profile/athleteProfileData'
import AthleteProfileClient from './app/_components/athlete/profile/AthleteProfileClient'

async function run() {
  const allAthletes = await getAllAthletesLive();
  const athlete = allAthletes.find((a: any) => a.skfId?.replace(/\s+/g, '') === 'SKF25MP001');
  const rankInfo = await getAthleteRankLive(athlete.id);
  const allEvents = await getAllEventsLive();
  const branchCoachMap = await getBranchCoachNameMapLive();
  const profile = buildRestoredAthleteProfileData(athlete, rankInfo, allEvents, branchCoachMap);

  try {
    const html = renderToStaticMarkup(<AthleteProfileClient {...profile} isDashboardContext={true} />);
    console.log('SUCCESS, length:', html.length);
  } catch (err: any) {
    console.error('ERROR during render:', err.message);
    console.error(err.stack);
  }
}
run();
