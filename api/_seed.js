// Starting programme, written to the database the first time the app loads.
const ex = (id, name, sets, repMin, repMax) => ({ id, name, sets, repMin, repMax });
export const SEED_PROGRAM = {
  version: 1,
  updatedAt: new Date().toISOString(),
  history: [{ version: 1, date: new Date().toISOString().slice(0, 10), summary: 'Starting Push, Pull, Legs split, three sessions a week.', changes: [] }],
  days: [
    { id: 'push', name: 'Push', weekday: 'Monday', focus: 'Chest, shoulders, triceps', exercises: [
      ex('barbell-bench-press', 'Barbell bench press', 3, 6, 10),
      ex('incline-dumbbell-press', 'Incline dumbbell press', 3, 8, 12),
      ex('seated-shoulder-press', 'Seated shoulder press', 3, 8, 12),
      ex('lateral-raises', 'Lateral raises', 3, 12, 15),
      ex('triceps-pushdowns', 'Triceps pushdowns', 3, 10, 15),
      ex('overhead-triceps-extensions', 'Overhead triceps extensions', 2, 10, 15),
    ] },
    { id: 'pull', name: 'Pull', weekday: 'Wednesday', focus: 'Back, biceps, rear delts', exercises: [
      ex('pull-ups-lat-pulldowns', 'Pull-ups or lat pulldowns', 3, 6, 12),
      ex('chest-supported-rows', 'Chest-supported rows', 3, 8, 12),
      ex('seated-cable-rows', 'Seated cable rows', 3, 10, 12),
      ex('reverse-pec-deck', 'Reverse pec deck', 3, 12, 15),
      ex('biceps-curls', 'Biceps curls', 3, 8, 12),
      ex('hammer-curls', 'Hammer curls', 3, 10, 15),
    ] },
    { id: 'legs', name: 'Legs', weekday: 'Friday', focus: 'Quads, hamstrings, glutes, calves', exercises: [
      ex('barbell-squats', 'Barbell squats', 3, 6, 10),
      ex('romanian-deadlifts', 'Romanian deadlifts', 3, 8, 12),
      ex('leg-press', 'Leg press', 3, 10, 12),
      ex('leg-curls', 'Leg curls', 3, 10, 15),
      ex('bulgarian-split-squats', 'Bulgarian split squats', 2, 8, 12),
      ex('standing-calf-raises', 'Standing calf raises', 3, 12, 20),
    ] },
  ],
};
export const SEED_CREW = { names: ['Sudeep'] };
