import { LibraryExercise } from '../models/fitness';

export const STATIC_EXERCISE_LIBRARY: LibraryExercise[] = [
  {
    id: 'bench_press',
    name: 'Bench Press',
    targetMuscleGroup: 'Chest',
    instructions: [
      'Lie flat on a bench and grip the barbell slightly wider than shoulder-width.',
      'Unrack the bar and lower it slowly to your mid-chest.',
      'Push the bar back up powerfully until your arms are fully extended.'
    ],
    techniqueNotes: 'Keep your feet flat on the floor and retract your shoulder blades to protect your shoulders.'
  },
  {
    id: 'barbell_squat',
    name: 'Barbell Squat',
    targetMuscleGroup: 'Legs',
    instructions: [
      'Place the barbell on your upper back/traps and stand with feet shoulder-width apart.',
      'Hinge at your hips and bend your knees to lower your body until thighs are parallel to the ground.',
      'Push through your heels to return to the starting upright position.'
    ],
    techniqueNotes: 'Keep your chest up and do not let your knees cave inward during the lift.'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    targetMuscleGroup: 'Back',
    instructions: [
      'Stand with feet mid-foot under the barbell.',
      'Bend over and grab the bar with a shoulder-width grip.',
      'Keep your back flat, hinge at the hips, and stand up straight lifting the bar along your shins.'
    ],
    techniqueNotes: 'Engage your core and maintain a neutral spine. Do not round your lower back under weight.'
  },
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    targetMuscleGroup: 'Shoulders',
    instructions: [
      'Hold a barbell at shoulder height with palms facing forward.',
      'Press the bar straight overhead by extending your arms and locking your elbows.',
      'Lower the bar back down under control to shoulder height.'
    ],
    techniqueNotes: 'Squeeze your glutes and brace your core to prevent excessive arching in your lower back.'
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    targetMuscleGroup: 'Back',
    instructions: [
      'Sit at a pulldown station and grip the bar slightly wider than shoulder-width.',
      'Pull the bar down toward your upper chest, squeezing your shoulder blades together.',
      'Extend your arms slowly to return the bar to the starting position.'
    ],
    techniqueNotes: 'Avoid leaning back excessively to pull the weight; focus on pulling with your elbows.'
  },
  {
    id: 'bicep_curl',
    name: 'Dumbbell Bicep Curl',
    targetMuscleGroup: 'Arms',
    instructions: [
      'Hold dumbbells at your sides with palms facing forward.',
      'Flex your elbows to lift the dumbbells toward your shoulders.',
      'Lower the weights under control back to the starting position.'
    ],
    techniqueNotes: 'Keep your elbows tucked into your sides and do not swing your torso to lift the weight.'
  },
  {
    id: 'tricep_pushdown',
    name: 'Cable Tricep Pushdown',
    targetMuscleGroup: 'Arms',
    instructions: [
      'Grip the cable attachment at chest level with elbows bent.',
      'Push the attachment downward until your arms are fully extended at your sides.',
      'Return the attachment slowly back to the starting point.'
    ],
    techniqueNotes: 'Keep your upper arms pinned to your torso; only move your forearms.'
  },
  {
    id: 'hanging_leg_raise',
    name: 'Hanging Leg Raise',
    targetMuscleGroup: 'Core',
    instructions: [
      'Hang from a pull-up bar with arms straight.',
      'Raise your legs slowly until they are parallel to the floor.',
      'Lower your legs slowly back to the starting vertical position.'
    ],
    techniqueNotes: 'Perform the movement slowly under control to avoid swinging your body.'
  }
];
