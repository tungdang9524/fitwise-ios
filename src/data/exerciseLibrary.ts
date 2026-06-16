import { LibraryExercise } from '../models/fitness';

export const STATIC_EXERCISE_LIBRARY: LibraryExercise[] = [
  {
    "id": "flat_barbell_bench_press",
    "name": "Flat Barbell Bench Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie flat on your back on a bench.",
      "Grip the barbell with hands slightly wider than shoulder-width.",
      "Lower the bar to your chest slowly and press it back up, locking your elbows at the top."
    ],
    "techniqueNotes": "Keep your feet flat on the floor and retract your shoulder blades."
  },
  {
    "id": "incline_barbell_bench_press",
    "name": "Incline Barbell Bench Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie on an incline bench angled at 30-45 degrees.",
      "Unrack the barbell with a medium-wide grip.",
      "Lower the bar to your upper chest and press it straight up to lockout."
    ],
    "techniqueNotes": "Focus on keeping your elbows under the barbell to avoid shoulder strain."
  },
  {
    "id": "decline_barbell_bench_press",
    "name": "Decline Barbell Bench Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie on a decline bench and secure your feet.",
      "Grip the barbell shoulder-width apart.",
      "Lower the bar to your lower chest, then press it back up."
    ],
    "techniqueNotes": "Always have a spotter for decline bench presses."
  },
  {
    "id": "flat_dumbbell_bench_press",
    "name": "Flat Dumbbell Bench Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie back on a flat bench holding dumbbells at your chest sides.",
      "Press the weights straight up over your chest.",
      "Lower the weights slowly back to the start."
    ],
    "techniqueNotes": "Dumbbells allow for a deeper stretch and more natural path than barbells."
  },
  {
    "id": "incline_dumbbell_bench_press",
    "name": "Incline Dumbbell Bench Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie back on an incline bench holding dumbbells at chest level.",
      "Press the weights straight up, bringing them slightly closer together at the top.",
      "Lower under control to your chest sides."
    ],
    "techniqueNotes": "Keep your wrists straight and aligned over your elbows."
  },
  {
    "id": "decline_dumbbell_bench_press",
    "name": "Decline Dumbbell Bench Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie on a decline bench with dumbbells at your chest.",
      "Press the weights vertically upwards.",
      "Lower slowly until dumbbells align with lower chest."
    ],
    "techniqueNotes": "Control the dumbbells carefully to maintain balance."
  },
  {
    "id": "close_grip_barbell_bench_press",
    "name": "Close-Grip Barbell Bench Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie on a bench and grip the barbell shoulder-width or slightly narrower.",
      "Lower the bar to your lower chest while keeping your elbows close to your torso.",
      "Press the bar back up powerfully."
    ],
    "techniqueNotes": "Mainly targets inner chest and triceps. Avoid a grip too narrow to protect wrists."
  },
  {
    "id": "close_grip_dumbbell_press",
    "name": "Close-Grip Dumbbell Press (Hex Press)",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie flat on a bench, holding dumbbells together over your chest.",
      "Squeeze the dumbbells together as hard as possible.",
      "Lower them to your chest while keeping them pressed together, then press up."
    ],
    "techniqueNotes": "Maintain constant tension by pushing the dumbbells together throughout the rep."
  },
  {
    "id": "reverse_grip_barbell_bench_press",
    "name": "Reverse-Grip Barbell Bench Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie on a flat bench.",
      "Grip the barbell with an underhand grip (palms facing your face).",
      "Lower the bar to your lower chest and press up."
    ],
    "techniqueNotes": "This variation shifts emphasis to the upper chest and reduces shoulder strain."
  },
  {
    "id": "dumbbell_chest_fly",
    "name": "Dumbbell Chest Fly",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie flat on a bench holding dumbbells above your chest, palms facing each other.",
      "Lower your arms out to the sides in a wide arc, maintaining a slight bend in your elbows.",
      "Squeeze your chest muscles to return to the starting position."
    ],
    "techniqueNotes": "Do not lower weights past shoulder level to protect shoulder joints."
  },
  {
    "id": "incline_dumbbell_chest_fly",
    "name": "Incline Dumbbell Chest Fly",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie on an incline bench holding dumbbells over your face.",
      "Lower the weights in a wide arc to your sides.",
      "Squeeze chest to return weights to the top."
    ],
    "techniqueNotes": "Keeps tension on the upper chest fibers."
  },
  {
    "id": "decline_dumbbell_chest_fly",
    "name": "Decline Dumbbell Chest Fly",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Lie on a decline bench holding dumbbells over your chest.",
      "Lower the weights out in a wide arc.",
      "Return to top by squeezing your chest."
    ],
    "techniqueNotes": "Targets lower chest fibers. Use a slow, controlled range."
  },
  {
    "id": "standing_cable_crossover_high_to_low",
    "name": "Standing Cable Crossover (High-to-Low)",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Set pulleys at high height, grab handles, and step forward.",
      "Keep a slight bend in your elbows, bring hands down and forward to meet at waist height.",
      "Slowly return to start under control."
    ],
    "techniqueNotes": "Engages lower and inner chest. Squeeze chest at the bottom."
  },
  {
    "id": "low_to_high_cable_crossover",
    "name": "Low-to-High Cable Crossover",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Set pulleys at lowest setting, grab handles, step forward.",
      "Bring hands forward and upward to meet at chest/chin height.",
      "Lower back to start under control."
    ],
    "techniqueNotes": "Highly isolates upper pectorals. Do not swing your body."
  },
  {
    "id": "flat_bench_cable_fly",
    "name": "Flat Bench Cable Fly",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Place a flat bench between two cable stations.",
      "Lie on your back, grab low pulley handles, and bring them over your chest.",
      "Perform fly motion, lowering hands to side and squeezing up."
    ],
    "techniqueNotes": "Cables provide constant tension unlike dumbbells."
  },
  {
    "id": "incline_bench_cable_fly",
    "name": "Incline Bench Cable Fly",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Set an incline bench between cable columns.",
      "Grab low pulley handles and perform fly motion over your upper chest.",
      "Squeeze at the top of the range."
    ],
    "techniqueNotes": "Maintains peak tension at the top contraction of the upper chest."
  },
  {
    "id": "machine_chest_press",
    "name": "Machine Chest Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Adjust machine seat so handles align with mid-chest.",
      "Press handles forward until arms are extended.",
      "Return handles slowly to start position."
    ],
    "techniqueNotes": "Great for safe hypertrophy without stabilizer fatigue."
  },
  {
    "id": "incline_machine_chest_press",
    "name": "Incline Machine Chest Press",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Sit in the incline press machine.",
      "Press handles forward and upward along the guided track.",
      "Lower slowly under control."
    ],
    "techniqueNotes": "Isolates upper pectorals with guided safety."
  },
  {
    "id": "pec_deck_fly",
    "name": "Pec Deck Fly (Machine)",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Sit in the pec deck machine with back flat against pad.",
      "Grip handles and bring pads/arms together in front of you.",
      "Squeeze chest at peak contraction, then slowly return to start."
    ],
    "techniqueNotes": "Keep your elbows slightly bent and level with your chest."
  },
  {
    "id": "bodyweight_pushup",
    "name": "Bodyweight Push-up",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Get into plank position, hands slightly wider than shoulder-width.",
      "Lower chest nearly to floor, keeping body in straight line.",
      "Push back up to plank position."
    ],
    "techniqueNotes": "Keep core braced and elbows at a 45-degree angle to body."
  },
  {
    "id": "incline_pushup",
    "name": "Incline Push-up (Hands Elevated)",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Place hands on a bench or elevated platform.",
      "Perform push-up by lowering chest to platform edge.",
      "Push back to starting position."
    ],
    "techniqueNotes": "Easier variation focusing more on lower chest fibers."
  },
  {
    "id": "decline_pushup",
    "name": "Decline Push-up (Feet Elevated)",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Place feet on a bench or step, hands on the floor in plank.",
      "Lower chest to floor and press back up."
    ],
    "techniqueNotes": "Advanced variation focusing on upper chest and front deltoids."
  },
  {
    "id": "diamond_pushup",
    "name": "Diamond Push-up",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Set hands close together under chest so index fingers and thumbs form a diamond.",
      "Lower chest to hands and press back up."
    ],
    "techniqueNotes": "Focuses heavily on triceps and inner chest muscles."
  },
  {
    "id": "wide_grip_pushup",
    "name": "Wide-Grip Push-up",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Place hands significantly wider than shoulder-width.",
      "Lower chest and press back up."
    ],
    "techniqueNotes": "Shifts load outward onto the chest and away from triceps."
  },
  {
    "id": "chest_dips",
    "name": "Chest Dips",
    "targetMuscleGroup": "Chest",
    "instructions": [
      "Grip parallel bars and lift body.",
      "Lean torso forward slightly, bend knees, and lower hips until shoulders are below elbows.",
      "Press back up to starting position."
    ],
    "techniqueNotes": "Leaning forward shifts emphasis to the lower chest."
  },
  {
    "id": "conventional_barbell_deadlift",
    "name": "Conventional Barbell Deadlift",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Stand with feet hip-width apart, barbell over mid-foot.",
      "Bend hips and grip bar, keeping back flat and shins touching bar.",
      "Stand up, dragging bar along shins, locking out at top."
    ],
    "techniqueNotes": "Keep back flat; do not round spine under load."
  },
  {
    "id": "sumo_barbell_deadlift",
    "name": "Sumo Barbell Deadlift",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Stand with wide stance, toes pointed outward.",
      "Grip barbell inside knees.",
      "Drive floor away with feet and lift bar straight up."
    ],
    "techniqueNotes": "Keeps torso more upright and stresses hips/legs/inner back."
  },
  {
    "id": "romanian_barbell_deadlift",
    "name": "Romanian Barbell Deadlift",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Hold barbell at hips. Push hips back, sliding bar down thighs.",
      "Keep knees slightly bent. Lower to mid-shin feeling hamstring stretch.",
      "Squeeze glutes and return to standing."
    ],
    "techniqueNotes": "Brace core and keep spine neutral. Do not round lower back."
  },
  {
    "id": "trap_bar_deadlift",
    "name": "Trap Bar Deadlift",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Stand inside a hex bar, grip handles.",
      "Lower hips, keep back flat, chest up.",
      "Drive through heels to stand straight up."
    ],
    "techniqueNotes": "Keeps weight centered, reducing lower back strain compared to barbell deadlifts."
  },
  {
    "id": "barbell_rack_pull",
    "name": "Barbell Rack Pulls",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Set safety bars in power rack just above/below knees.",
      "Hinge hips, grip bar, and pull it to upright lock position.",
      "Lower back to safety pins under control."
    ],
    "techniqueNotes": "Isolates the upper back and traps. Excellent overload movement."
  },
  {
    "id": "wide_grip_lat_pulldown",
    "name": "Wide-Grip Lat Pulldown",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Sit at machine, grip bar wide.",
      "Pull bar down to upper chest, leading with elbows.",
      "Return bar slowly to start."
    ],
    "techniqueNotes": "Targets upper back and lats for wide V-taper look."
  },
  {
    "id": "close_grip_lat_pulldown",
    "name": "Close-Grip Lat Pulldown",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Attach parallel grip handle (V-Bar) to pulldown station.",
      "Sit and pull handle down to upper chest, leaning back slightly.",
      "Return slowly."
    ],
    "techniqueNotes": "Emphasizes lower lat fibers and inner back muscles."
  },
  {
    "id": "reverse_grip_lat_pulldown",
    "name": "Reverse-Grip Lat Pulldown",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Sit at machine and grip bar with underhand grip.",
      "Pull bar down to upper chest.",
      "Extend arms slowly back to start."
    ],
    "techniqueNotes": "Increases bicep involvement and pulls lats through a long range."
  },
  {
    "id": "underhand_bent_over_row",
    "name": "Underhand Bent-Over Barbell Row",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Hinge hips, hold barbell with underhand grip.",
      "Pull bar to lower stomach, squeezing elbows back.",
      "Lower slowly."
    ],
    "techniqueNotes": "Also known as Yates Row, targets lower lats and biceps."
  },
  {
    "id": "overhand_bent_over_row",
    "name": "Overhand Bent-Over Barbell Row",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Hinge hips, hold barbell with overhand grip.",
      "Pull bar to upper abdomen, elbows out.",
      "Lower bar slowly."
    ],
    "techniqueNotes": "Focuses on mid-back, rear delts, and rhomboids."
  },
  {
    "id": "one_arm_dumbbell_row",
    "name": "One-Arm Dumbbell Row",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Place knee and hand on flat bench.",
      "Hold dumbbell in free hand.",
      "Pull dumbbell to hip, squeezing lat."
    ],
    "techniqueNotes": "Keep back flat and hips square to avoid twisting."
  },
  {
    "id": "chest_supported_dumbbell_row",
    "name": "Chest-Supported Dumbbell Row",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Lie chest down on incline bench (30 degrees).",
      "Hold dumbbells, arms hanging straight down.",
      "Row dumbbells up, pulling elbows towards ceiling."
    ],
    "techniqueNotes": "Prevents body momentum, isolating upper back and rhomboids."
  },
  {
    "id": "seated_cable_row_vbar",
    "name": "Seated Cable Row (V-Bar)",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Sit at cable row machine, grab V-Bar.",
      "Keep torso tall, pull bar to abdomen.",
      "Extend arms fully."
    ],
    "techniqueNotes": "Squeeze shoulder blades together at peak contraction."
  },
  {
    "id": "wide_grip_seated_cable_row",
    "name": "Wide-Grip Seated Cable Row",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Use wide lat bar on seated cable row station.",
      "Pull bar to chest, elbows wide.",
      "Return under control."
    ],
    "techniqueNotes": "Focuses heavily on upper back, rear delts, and rhomboids."
  },
  {
    "id": "one_arm_seated_cable_row",
    "name": "One-Arm Seated Cable Row",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Attach single handle to cable row station.",
      "Row handle to side of waist, rotating torso slightly at end.",
      "Return under control."
    ],
    "techniqueNotes": "Allows unilateral focus to balance strength differences."
  },
  {
    "id": "t_bar_row",
    "name": "T-Bar Row (Machine)",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Step onto platform, hold handles.",
      "Hinge hips, back flat, row bar to chest.",
      "Lower slowly."
    ],
    "techniqueNotes": "Keeps path guided, great for middle back mass."
  },
  {
    "id": "pullup_overhand",
    "name": "Pull-up (Overhand)",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Grip bar with overhand grip wider than shoulders.",
      "Pull chest to bar, driving elbows down.",
      "Lower slowly to dead hang."
    ],
    "techniqueNotes": "Hard core back exercise. Keep core tight."
  },
  {
    "id": "chinup_underhand",
    "name": "Chin-up (Underhand)",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Grip bar with underhand grip shoulder-width.",
      "Pull chin over bar.",
      "Lower to full extension."
    ],
    "techniqueNotes": "High bicep and lower lat recruitment."
  },
  {
    "id": "neutral_grip_pullup",
    "name": "Neutral Grip Pull-up",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Grip parallel handles on pull-up bar.",
      "Pull chest to handles.",
      "Lower under control."
    ],
    "techniqueNotes": "Easiest pull-up on wrists and shoulders."
  },
  {
    "id": "lat_pushdown_cable",
    "name": "Lat Pushdown (Cable)",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Stand at cable station, grab bar overhead.",
      "Keep arms straight, hinge forward slightly.",
      "Pull bar down to thighs using lats."
    ],
    "techniqueNotes": "Isolates lats without bicep involvement."
  },
  {
    "id": "back_extension_machine",
    "name": "Back Extension (Hyperextension)",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Position hips on extension bench pads.",
      "Hinge at hips to lower upper body.",
      "Raise torso back up to align with legs."
    ],
    "techniqueNotes": "Do not hyperextend/arch lower spine past straight line."
  },
  {
    "id": "machine_row_guided",
    "name": "Guided Machine Row",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Sit facing pad on row machine.",
      "Pull handles toward chest.",
      "Return handles slowly."
    ],
    "techniqueNotes": "Focus purely on contracting back muscle fibers."
  },
  {
    "id": "inverted_bodyweight_row",
    "name": "Inverted Bodyweight Row",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Set barbell in rack at hip height.",
      "Lie underneath bar, grip overhand, heels on floor.",
      "Row chest up to bar, keeping body straight."
    ],
    "techniqueNotes": "Adjust difficulty by changing foot position height."
  },
  {
    "id": "single_arm_cable_row",
    "name": "Single-Arm Cable Row (Standing)",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Stand at cable station with single handle.",
      "Row handle to hip, keeping body square.",
      "Extend arm fully."
    ],
    "techniqueNotes": "Increases core rotation stability requirements."
  },
  {
    "id": "face_pulls_upperback",
    "name": "Face Pulls (Upper Back / Rear Delts)",
    "targetMuscleGroup": "Back",
    "instructions": [
      "Attach rope to high cable column.",
      "Pull rope towards forehead, pulling hands apart at end.",
      "Slowly return."
    ],
    "techniqueNotes": "Great for shoulder health and upper back posture."
  },
  {
    "id": "barbell_back_squat",
    "name": "Barbell Back Squat",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Place barbell on traps, stand feet shoulder-width.",
      "Bend knees and push hips back to lower thighs parallel to floor.",
      "Drive up through heels."
    ],
    "techniqueNotes": "Keep chest up and knees tracking over toes."
  },
  {
    "id": "barbell_front_squat",
    "name": "Barbell Front Squat",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Rest barbell on front shoulders, hold with clean grip or cross arms.",
      "Keep torso upright, squat down parallel.",
      "Drive back up."
    ],
    "techniqueNotes": "Focuses heavily on quadriceps and core strength."
  },
  {
    "id": "barbell_box_squat",
    "name": "Barbell Box Squat",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Squat down with barbell until hips touch box behind you.",
      "Pause briefly on box, then drive back up to stand."
    ],
    "techniqueNotes": "Builds explosive power out of the bottom of the squat."
  },
  {
    "id": "goblet_squat_db",
    "name": "Goblet Squat (Dumbbell)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Hold dumbbell vertically against chest.",
      "Squat down until hips go below parallel.",
      "Push back to starting position."
    ],
    "techniqueNotes": "Excellent for beginners learning squat depth."
  },
  {
    "id": "walking_lunges_db",
    "name": "Dumbbell Walking Lunges",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Step forward with dumbbells at sides.",
      "Lower hips until back knee is near floor.",
      "Step forward with opposite foot and repeat."
    ],
    "techniqueNotes": "Keep torso upright to avoid lower back pull."
  },
  {
    "id": "reverse_lunges_db",
    "name": "Dumbbell Reverse Lunges",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Step backward with one leg and lower hips.",
      "Push off back foot to return to stand.",
      "Alternate sides."
    ],
    "techniqueNotes": "Easier on knees than forward lunges."
  },
  {
    "id": "side_lunges_db",
    "name": "Dumbbell Side Lunges",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Step wide to side, bending knee of leading leg.",
      "Keep trailing leg straight.",
      "Push back to center."
    ],
    "techniqueNotes": "Works inner and outer thighs (adductors/abductors)."
  },
  {
    "id": "bulgarian_split_squat_db",
    "name": "Bulgarian Split Squat (Dumbbell)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Place back foot on bench, hold dumbbells.",
      "Lower hips until back knee is just above floor.",
      "Drive front heel into floor to stand up."
    ],
    "techniqueNotes": "Excellent single-leg isolation movement."
  },
  {
    "id": "leg_press_horizontal",
    "name": "Horizontal Leg Press (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Sit in horizontal machine, feet on plate.",
      "Push plate away until legs are extended.",
      "Lower under control."
    ],
    "techniqueNotes": "Good for high-reps volume safely."
  },
  {
    "id": "leg_press_45degree",
    "name": "45-Degree Leg Press (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Lie on back in leg press sled, feet shoulder-width.",
      "Release safety pins, bend knees to lower sled to 90 degrees.",
      "Push sled back up without locking knees."
    ],
    "techniqueNotes": "Do not let lower back lift off the pad."
  },
  {
    "id": "hack_squat_machine",
    "name": "Hack Squat (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Place shoulders under pads on hack squat slide.",
      "Lower sled until thighs are parallel to footplate.",
      "Press sled up."
    ],
    "techniqueNotes": "Emphasizes outer quad sweep."
  },
  {
    "id": "leg_extension_guided",
    "name": "Leg Extension (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Sit in extension machine, place shins behind roller pads.",
      "Extend legs fully to lift weight.",
      "Lower slowly."
    ],
    "techniqueNotes": "Isolates the quadriceps. Squeeze at top."
  },
  {
    "id": "lying_leg_curl_machine",
    "name": "Lying Leg Curl (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Lie face down, secure roller pad behind calves.",
      "Curl heels toward glutes.",
      "Return slowly."
    ],
    "techniqueNotes": "Keeps hamstring under constant tension."
  },
  {
    "id": "seated_leg_curl_machine",
    "name": "Seated Leg Curl (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Sit in machine, thighs locked under pad, calves on roller.",
      "Curl legs down and back under seat.",
      "Extend slowly."
    ],
    "techniqueNotes": "Greater hamstring stretch than lying version."
  },
  {
    "id": "standing_leg_curl_machine",
    "name": "Standing Leg Curl (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Stand at machine, place one calf behind roller.",
      "Curl heel to glute unilaterally.",
      "Switch sides."
    ],
    "techniqueNotes": "Unilateral isolation for correcting hamstring imbalances."
  },
  {
    "id": "romanian_deadlift_db",
    "name": "Romanian Deadlift (Dumbbell)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Hold dumbbells in front of thighs.",
      "Push hips back and slide weights down legs.",
      "Stand back up, squeezing glutes."
    ],
    "techniqueNotes": "Focus on the hip hinge. Do not squat the weight."
  },
  {
    "id": "stiff_legged_deadlift_barbell",
    "name": "Stiff-Legged Deadlift (Barbell)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Stand with knees locked or slightly soft.",
      "Hinge hips to lower bar to feet.",
      "Pull back to upright position using glutes/hamstrings."
    ],
    "techniqueNotes": "Long range of motion. Do not round spine."
  },
  {
    "id": "single_leg_romanian_deadlift_db",
    "name": "Single-Leg Romanian Deadlift (Dumbbell)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Stand on one leg, hold dumbbell in opposite hand.",
      "Hinge at hip, lifting back leg straight behind.",
      "Return to standing."
    ],
    "techniqueNotes": "Builds ankle stability, balance, and unilateral glute strength."
  },
  {
    "id": "glute_ham_raise",
    "name": "Glute Ham Raise",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Lock ankles into GHR machine bench.",
      "Lower torso forward until horizontal.",
      "Pull body up using hamstrings and glutes."
    ],
    "techniqueNotes": "Highly advanced hamstring developer."
  },
  {
    "id": "barbell_hip_thrust",
    "name": "Barbell Hip Thrust",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Sit on floor, upper back against bench, barbell over hips.",
      "Drive feet into floor and push hips up to ceiling.",
      "Lower hips to floor."
    ],
    "techniqueNotes": "Best exercise for overall glute hypertrophy."
  },
  {
    "id": "dumbbell_hip_thrust",
    "name": "Dumbbell Hip Thrust",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Sit against bench, place dumbbell on pelvis.",
      "Drive hips upward, pausing at lockout."
    ],
    "techniqueNotes": "Easy setup alternative to barbell hip thrusts."
  },
  {
    "id": "cable_pull_through",
    "name": "Cable Pull-Through",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Stand facing away from low pulley with rope between legs.",
      "Hinge hips forward to let rope go back.",
      "Snap hips forward to stand upright."
    ],
    "techniqueNotes": "Teaches the hip hinge pattern safely without axial loading."
  },
  {
    "id": "standing_calf_raise_machine",
    "name": "Standing Calf Raise (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Place shoulders under pads, balls of feet on block.",
      "Lower heels as far as possible, then press up onto toes.",
      "Hold contraction at top."
    ],
    "techniqueNotes": "Work through full range of motion. Do not bounce."
  },
  {
    "id": "seated_calf_raise_machine",
    "name": "Seated Calf Raise (Machine)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Sit, place thigh pads over knees, toes on block.",
      "Lower heels, then press up onto toes."
    ],
    "techniqueNotes": "Emphasizes the soleus muscle under the knee bend."
  },
  {
    "id": "donkey_calf_raise",
    "name": "Donkey Calf Raise",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Hinge hips, rest elbows on pad, place partner or weight on lower back.",
      "Perform calf raises on toe block."
    ],
    "techniqueNotes": "Stretches calves at a different hip angle."
  },
  {
    "id": "leg_press_calf_raise",
    "name": "Leg Press Calf Raise",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Sit in leg press, place balls of feet on bottom edge of sled.",
      "Unlock sled, push forward and backward flexing ankles."
    ],
    "techniqueNotes": "Maintain slightly soft knees to avoid hyperextension."
  },
  {
    "id": "bodyweight_air_squats",
    "name": "Bodyweight Air Squats",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Stand feet shoulder-width, squat down past parallel.",
      "Stand back up."
    ],
    "techniqueNotes": "Great high-rep warm up or endurance exercise."
  },
  {
    "id": "jump_squats_bodyweight",
    "name": "Jump Squats (Bodyweight)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Squat down and explode upward into jump.",
      "Land softly and repeat immediately."
    ],
    "techniqueNotes": "Develops lower body plyometric power."
  },
  {
    "id": "step_ups_db",
    "name": "Dumbbell Step-ups",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Hold dumbbells, place one foot on box.",
      "Step up using front leg strength.",
      "Step down and alternate."
    ],
    "techniqueNotes": "Do not push off with the trailing leg."
  },
  {
    "id": "sled_push_prowler",
    "name": "Sled Push (Prowler)",
    "targetMuscleGroup": "Legs",
    "instructions": [
      "Grip prowler handles, lean forward at 45 degrees.",
      "Drive legs to push sled forward."
    ],
    "techniqueNotes": "Builds quad endurance and lung capacity."
  },
  {
    "id": "seated_barbell_overhead_press",
    "name": "Seated Barbell Overhead Press",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Sit upright on bench, unrack bar at shoulder height.",
      "Press bar straight overhead.",
      "Lower slowly."
    ],
    "techniqueNotes": "Maintains vertical core support under heavy loads."
  },
  {
    "id": "military_press_standing",
    "name": "Military Press (Standing Barbell)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Stand feet together, hold barbell at collarbone.",
      "Press barbell straight up.",
      "Lower to starting position."
    ],
    "techniqueNotes": "Keep core tight to protect lower back."
  },
  {
    "id": "seated_dumbbell_shoulder_press",
    "name": "Seated Dumbbell Shoulder Press",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Sit, press dumbbells overhead from shoulders.",
      "Lower under control."
    ],
    "techniqueNotes": "Keeps load distributed equally between shoulders."
  },
  {
    "id": "standing_dumbbell_shoulder_press",
    "name": "Standing Dumbbell Shoulder Press",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Stand holding dumbbells at shoulders.",
      "Press weights straight overhead.",
      "Lower slowly."
    ],
    "techniqueNotes": "Requires more core stability than seated version."
  },
  {
    "id": "arnold_press_db",
    "name": "Arnold Press (Dumbbell)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Hold dumbbells at face, palms facing you.",
      "Press weights overhead while twisting palms outward."
    ],
    "techniqueNotes": "Involves front and lateral delts in one movement."
  },
  {
    "id": "dumbbell_lateral_raise_standing",
    "name": "Dumbbell Lateral Raise (Standing)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Raise dumbbells to sides to shoulder height.",
      "Lower slowly."
    ],
    "techniqueNotes": "Lead with elbows, keep pinkies up slightly."
  },
  {
    "id": "dumbbell_lateral_raise_seated",
    "name": "Dumbbell Lateral Raise (Seated)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Sit on bench, raise dumbbells to sides.",
      "Lower under control."
    ],
    "techniqueNotes": "Removes leg momentum for strict delt isolation."
  },
  {
    "id": "cable_lateral_raise_behind_back",
    "name": "Cable Lateral Raise (Behind Back)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Stand in front of cable machine, pull cable behind back to side."
    ],
    "techniqueNotes": "Keeps tension on side delts at the bottom."
  },
  {
    "id": "cable_lateral_raise_front",
    "name": "Cable Lateral Raise (In Front)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Cross handle in front of body, raise to side."
    ],
    "techniqueNotes": "Excellent continuous resistance path."
  },
  {
    "id": "machine_lateral_raise_guided",
    "name": "Machine Lateral Raise",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Sit in machine, place elbows against pads.",
      "Raise elbows to sides against resistance."
    ],
    "techniqueNotes": "Great for finishing delts safely."
  },
  {
    "id": "dumbbell_front_raise_standing",
    "name": "Dumbbell Front Raise (Standing)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Raise dumbbells forward to shoulder height.",
      "Lower under control."
    ],
    "techniqueNotes": "Isolates the anterior (front) deltoid."
  },
  {
    "id": "barbell_front_raise_standing",
    "name": "Barbell Front Raise (Standing)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Hold bar, raise straight forward in front of chest."
    ],
    "techniqueNotes": "Keep wrists straight."
  },
  {
    "id": "plate_front_raise",
    "name": "Plate Front Raise",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Hold weight plate at 9 and 3 o'clock.",
      "Raise plate in front of face, lower slowly."
    ],
    "techniqueNotes": "Brace core to avoid swinging torso."
  },
  {
    "id": "cable_front_raise_rope",
    "name": "Cable Front Raise (Rope)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Straddle low cable, hold rope with neutral grip.",
      "Raise arms forward to chest height."
    ],
    "techniqueNotes": "Constant tension for front delts."
  },
  {
    "id": "dumbbell_rear_delt_fly_bentover",
    "name": "Dumbbell Rear Delt Fly (Bent-Over)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Hinge forward, raise dumbbells to sides.",
      "Lower slowly."
    ],
    "techniqueNotes": "Squeeze back of shoulders, not upper back."
  },
  {
    "id": "dumbbell_rear_delt_fly_seated",
    "name": "Dumbbell Rear Delt Fly (Seated)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Sit at end of bench, lean chest forward to knees.",
      "Raise dumbbells to sides."
    ],
    "techniqueNotes": "Prevents torso rocking."
  },
  {
    "id": "cable_rear_delt_fly_standing",
    "name": "Cable Rear Delt Fly (Standing)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Cross cable cables in front of face without handles.",
      "Pull arms wide to sides."
    ],
    "techniqueNotes": "Isolates rear deltoids perfectly."
  },
  {
    "id": "cable_face_pull_rope",
    "name": "Cable Face Pull",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Pull rope attachment to nose, flaring elbows wide."
    ],
    "techniqueNotes": "Promotes shoulder external rotation."
  },
  {
    "id": "dumbbell_shrugs_standing",
    "name": "Dumbbell Shrugs (Standing)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Hold dumbbells, raise shoulders to ears."
    ],
    "techniqueNotes": "Squeeze traps at the top; do not roll shoulders."
  },
  {
    "id": "barbell_shrugs_standing",
    "name": "Barbell Shrugs (Standing)",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Hold barbell in front, shrug upward."
    ],
    "techniqueNotes": "Can handle heavier loads."
  },
  {
    "id": "behind_back_barbell_shrug",
    "name": "Behind-the-Back Barbell Shrugs",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Hold bar behind glutes, shrug shoulders up."
    ],
    "techniqueNotes": "Hits middle/lower traps differently."
  },
  {
    "id": "smith_machine_upright_row",
    "name": "Smith Machine Upright Row",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Grip Smith bar wide, pull up to chest, elbows high."
    ],
    "techniqueNotes": "Guided bar path reduces wrist twisting."
  },
  {
    "id": "dumbbell_upright_row",
    "name": "Dumbbell Upright Row",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Pull dumbbells up to chest, elbows pointing to ceiling."
    ],
    "techniqueNotes": "Safer on shoulder joints than barbell version."
  },
  {
    "id": "barbell_upright_row",
    "name": "Barbell Upright Row",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Hold bar close-grip, pull up to chest, elbows high."
    ],
    "techniqueNotes": "Avoid pulling too high if you experience shoulder pinching."
  },
  {
    "id": "incline_dumbbell_yraise",
    "name": "Incline Dumbbell Y-Raise",
    "targetMuscleGroup": "Shoulders",
    "instructions": [
      "Lie chest down on incline bench.",
      "Raise dumbbells up and outward in Y shape."
    ],
    "techniqueNotes": "Excellent for lower traps and rear delts."
  },
  {
    "id": "dumbbell_bicep_curl_alt",
    "name": "Alternating Dumbbell Bicep Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Stand tall, curl one dumbbell up, rotating palm up.",
      "Lower slowly and repeat with other arm."
    ],
    "techniqueNotes": "Turn wrist at the top (supinate) for maximum bicep peak."
  },
  {
    "id": "barbell_bicep_curl_standing",
    "name": "Standing Barbell Bicep Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Hold barbell underhand, curl to chest.",
      "Lower slowly."
    ],
    "techniqueNotes": "Keep elbows pinned at sides. No swinging."
  },
  {
    "id": "ez_bar_bicep_curl",
    "name": "Standing EZ-Bar Bicep Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Curl EZ-bar using angled grips.",
      "Lower slowly."
    ],
    "techniqueNotes": "Easier on wrists than straight barbell curls."
  },
  {
    "id": "incline_dumbbell_curl",
    "name": "Incline Dumbbell Bicep Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Lie on incline bench, let arms hang.",
      "Curl weights up without moving elbows forward."
    ],
    "techniqueNotes": "Places bicep under intense stretch at start."
  },
  {
    "id": "concentration_curl_db",
    "name": "Concentration Bicep Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Sit, rest elbow against inner thigh.",
      "Curl dumbbell toward face."
    ],
    "techniqueNotes": "Isolates the bicep, preventing stabilizer help."
  },
  {
    "id": "preacher_ez_bar_curl",
    "name": "Preacher EZ-Bar Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Rest arms on preacher pad, curl EZ-bar.",
      "Extend fully, then curl up."
    ],
    "techniqueNotes": "Strict movement. Do not use momentum."
  },
  {
    "id": "preacher_dumbbell_curl",
    "name": "Preacher Dumbbell Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Rest arm on preacher pad, curl dumbbell unilaterally."
    ],
    "techniqueNotes": "Good for correcting arm size imbalances."
  },
  {
    "id": "hammer_curl_standing",
    "name": "Standing Dumbbell Hammer Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Curl dumbbells with palms facing each other (neutral grip)."
    ],
    "techniqueNotes": "Builds bicep width and forearm mass."
  },
  {
    "id": "cable_rope_hammer_curl",
    "name": "Cable Rope Hammer Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Grab rope at low pulley, curl upward."
    ],
    "techniqueNotes": "Provides constant tension throughout."
  },
  {
    "id": "cable_bicep_curl_straight",
    "name": "Standing Cable Bicep Curl (Straight Bar)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Curl straight bar attachment at low pulley."
    ],
    "techniqueNotes": "Keeps resistance loaded at contraction peak."
  },
  {
    "id": "high_cable_bicep_curl",
    "name": "High Cable Bicep Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Hold handles from high pulley stations, curl towards ears."
    ],
    "techniqueNotes": "Also known as double bicep cable curl."
  },
  {
    "id": "spider_curl_db",
    "name": "Spider Curl (Dumbbell)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Lie chest down on incline bench, curl weights upward."
    ],
    "techniqueNotes": "Creates peak tension at the top contraction."
  },
  {
    "id": "zottman_curl_db",
    "name": "Zottman Curl (Dumbbell)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Curl dumbbell underhand, rotate palms forward at top, lower overhand."
    ],
    "techniqueNotes": "Combines bicep curl with forearm wrist extension builder."
  },
  {
    "id": "reverse_grip_barbell_curl",
    "name": "Reverse-Grip Barbell Bicep Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Hold barbell overhand, curl to shoulders."
    ],
    "techniqueNotes": "Builds forearms and outer biceps brachii."
  },
  {
    "id": "cable_tricep_pushdown_straight",
    "name": "Cable Tricep Pushdown (Straight Bar)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Push straight bar cable attachment down to thighs."
    ],
    "techniqueNotes": "Allows for heavier loading."
  },
  {
    "id": "cable_tricep_pushdown_rope",
    "name": "Cable Tricep Pushdown (Rope)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Push rope attachment down, pulling ends apart at bottom."
    ],
    "techniqueNotes": "Squeezes outer head of triceps."
  },
  {
    "id": "cable_tricep_pushdown_vbar",
    "name": "Cable Tricep Pushdown (V-Bar)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Push V-Bar attachment down."
    ],
    "techniqueNotes": "Comfortable neutral-ish wrist angle."
  },
  {
    "id": "overhead_tricep_extension_db_twoarms",
    "name": "Dumbbell Overhead Tricep Extension (Two-Handed)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Hold dumbbell with both hands, lower behind head, press up."
    ],
    "techniqueNotes": "Keep elbows close to head."
  },
  {
    "id": "overhead_tricep_extension_ezbar",
    "name": "Overhead Tricep Extension (EZ-Bar)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Hold EZ Bar, lower behind neck, press up."
    ],
    "techniqueNotes": "Work through deep stretch at bottom."
  },
  {
    "id": "overhead_tricep_extension_cable_rope",
    "name": "Overhead Tricep Extension (Cable Rope)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Facing away from pulley, pull rope extension forward over head."
    ],
    "techniqueNotes": "Continuous stretch under constant load."
  },
  {
    "id": "skull_crusher_ezbar_arms",
    "name": "Skull Crusher (EZ-Bar / Triceps)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Lie flat, lower EZ bar to forehead, extend arms."
    ],
    "techniqueNotes": "Keep upper arm bone stationary."
  },
  {
    "id": "dumbbell_tricep_kickback",
    "name": "Dumbbell Tricep Kickback",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Bend forward, hold elbow up, extend forearm backward."
    ],
    "techniqueNotes": "Lock shoulder in place, only move forearm."
  },
  {
    "id": "bench_dips_bodyweight",
    "name": "Bench Dips (Bodyweight)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Lower hips between benches by bending elbows."
    ],
    "techniqueNotes": "Good finishing pump movement."
  },
  {
    "id": "parallel_bar_dips_arms",
    "name": "Parallel Bar Dips (Triceps Focus)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Keep torso upright, lower body, press up."
    ],
    "techniqueNotes": "Upright posture targets triceps over chest."
  },
  {
    "id": "close_grip_bench_press_tricep",
    "name": "Close-Grip Bench Press (Triceps)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Barbell press with narrow grip flat bench."
    ],
    "techniqueNotes": "Main builder for triceps power."
  },
  {
    "id": "single_arm_cable_tricep_extension",
    "name": "Single-Arm Cable Tricep Extension",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Push single handle down unilaterally."
    ],
    "techniqueNotes": "Ensures equal tricep balance."
  },
  {
    "id": "dumbbell_wrist_curl_underhand",
    "name": "Dumbbell Wrist Curl (Underhand)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Rest forearms on bench palms up, curl dumbbells up with wrists."
    ],
    "techniqueNotes": "Isolates wrist flexors."
  },
  {
    "id": "dumbbell_wrist_curl_overhand",
    "name": "Dumbbell Wrist Curl (Overhand)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Rest forearms on bench palms down, curl dumbbells up with wrists."
    ],
    "techniqueNotes": "Isolates wrist extensors."
  },
  {
    "id": "reverse_barbell_wrist_curl",
    "name": "Reverse Barbell Wrist Curl",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Curl barbell overhand using wrists only."
    ],
    "techniqueNotes": "Builds top forearms."
  },
  {
    "id": "plate_pinches_forearm",
    "name": "Plate Pinches (Forearms)",
    "targetMuscleGroup": "Arms",
    "instructions": [
      "Pinch plates together between thumb and fingers, hold for time."
    ],
    "techniqueNotes": "Builds crushing grip strength."
  },
  {
    "id": "hanging_leg_raise_core",
    "name": "Hanging Leg Raise (Core)",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Hang from bar, raise straight legs to parallel."
    ],
    "techniqueNotes": "Control the swing."
  },
  {
    "id": "hanging_knee_raise_core",
    "name": "Hanging Knee Raise",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Hang from bar, pull knees to chest."
    ],
    "techniqueNotes": "Easier variation of leg raise."
  },
  {
    "id": "abdominal_crunch_flat",
    "name": "Abdominal Crunch",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Lie flat, bend knees, lift shoulders."
    ],
    "techniqueNotes": "Engage abs, do not pull head."
  },
  {
    "id": "decline_crunch_weighted",
    "name": "Decline Crunch",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Perform crunches on decline bench."
    ],
    "techniqueNotes": "Adds resistance due to angle."
  },
  {
    "id": "cable_crunch_kneeling",
    "name": "Cable Crunch (Kneeling)",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Hold rope at head, kneel, crunch torso down."
    ],
    "techniqueNotes": "Flex the spine, do not sit hips back."
  },
  {
    "id": "flat_bench_leg_raise",
    "name": "Flat Bench Leg Raise",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Lie on bench, raise legs to ceiling."
    ],
    "techniqueNotes": "Press lower back flat."
  },
  {
    "id": "lying_knee_raise_reverse_crunch",
    "name": "Reverse Crunch",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Lie flat, pull knees to face, lift hips."
    ],
    "techniqueNotes": "Hits lower ab fibers."
  },
  {
    "id": "plank_elbow_standard",
    "name": "Standard Elbow Plank",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Hold plank on forearms."
    ],
    "techniqueNotes": "Align head to heels in straight line."
  },
  {
    "id": "plank_hand_standard",
    "name": "Standard Hand Plank",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Hold plank on hands."
    ],
    "techniqueNotes": "Push floor away actively."
  },
  {
    "id": "side_plank_left",
    "name": "Side Elbow Plank (Left)",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Hold side plank on left elbow."
    ],
    "techniqueNotes": "Keep hips lifted high."
  },
  {
    "id": "side_plank_right",
    "name": "Side Elbow Plank (Right)",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Hold side plank on right elbow."
    ],
    "techniqueNotes": "Squeeze obliques."
  },
  {
    "id": "russian_twist_weighted",
    "name": "Russian Twist (Weighted)",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Sit, lean back, twist plate side to side."
    ],
    "techniqueNotes": "Excellent oblique developer."
  },
  {
    "id": "ab_wheel_rollout_kneeling",
    "name": "Ab Wheel Rollout",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Roll wheel out kneeling, pull back."
    ],
    "techniqueNotes": "Brace core strongly; do not sag lower back."
  },
  {
    "id": "mountain_climbers_core",
    "name": "Mountain Climbers",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Drive knees forward in plank speed position."
    ],
    "techniqueNotes": "Conditioning plus core."
  },
  {
    "id": "bicycle_crunch_core",
    "name": "Bicycle Crunch",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Twist elbow to opposite knee alternating."
    ],
    "techniqueNotes": "Keep shoulder blades off floor."
  },
  {
    "id": "dead_bug_hold",
    "name": "Dead Bug",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Lying, extend opposite arm and leg."
    ],
    "techniqueNotes": "Great core stabilizer control exercise."
  },
  {
    "id": "bird_dog_hold",
    "name": "Bird Dog",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Kneeling, extend opposite arm and leg."
    ],
    "techniqueNotes": "Strengthens lower back stabilizer muscles."
  },
  {
    "id": "flutter_kicks_core",
    "name": "Flutter Kicks",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Lying on back, raise heels slightly, kick up and down."
    ],
    "techniqueNotes": "Engages lower rectus abdominis."
  },
  {
    "id": "toe_touches_lying",
    "name": "Lying Toe Touches",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Raise legs straight up, reach fingers to toes."
    ],
    "techniqueNotes": "Focus on upper abs flex."
  },
  {
    "id": "woodchopper_high_to_low",
    "name": "Woodchopper (High-to-Low Cable)",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Pull cable diagonally downward across body."
    ],
    "techniqueNotes": "Rotational power for obliques."
  },
  {
    "id": "woodchopper_low_to_high",
    "name": "Woodchopper (Low-to-High Cable)",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Pull cable diagonally upward across body."
    ],
    "techniqueNotes": "Builds dynamic rotational core strength."
  },
  {
    "id": "captains_chair_leg_raise",
    "name": "Captain's Chair Leg Raise",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Support weight on forearms, lift knees/legs."
    ],
    "techniqueNotes": "Avoid swinging. Keep hips pressed back."
  },
  {
    "id": "windshield_wipers_lying",
    "name": "Windshield Wipers (Lying)",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Lying on back, legs straight up, lower side to side."
    ],
    "techniqueNotes": "Works deep rotational obliques."
  },
  {
    "id": "hollow_body_hold",
    "name": "Hollow Body Hold",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Lie flat, raise legs and head slightly, hold shape."
    ],
    "techniqueNotes": "Press lower spine into the ground."
  },
  {
    "id": "superman_hold",
    "name": "Superman Hold",
    "targetMuscleGroup": "Core",
    "instructions": [
      "Lie face down, lift hands and chest plus legs, hold."
    ],
    "techniqueNotes": "Excellent for lower back extensors."
  },
  {
    "id": "arm_circles_forward",
    "name": "Arm Circles (Forward)",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Stand tall, rotate arms forward in circle."
    ],
    "techniqueNotes": "Loosens shoulders."
  },
  {
    "id": "arm_circles_backward",
    "name": "Arm Circles (Backward)",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Rotate arms backward in circles."
    ],
    "techniqueNotes": "Shoulder joint warmup."
  },
  {
    "id": "neck_rotations_warmup",
    "name": "Neck Rotations",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Slowly roll neck in circles."
    ],
    "techniqueNotes": "Releases neck stiffness."
  },
  {
    "id": "torso_twists_warmup",
    "name": "Torso Twists",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Rotate torso side to side, swing arms."
    ],
    "techniqueNotes": "T-spine mobility."
  },
  {
    "id": "hip_circles_cw",
    "name": "Hip Circles (Clockwise)",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Circle hips clockwise."
    ],
    "techniqueNotes": "Loosens hip joint."
  },
  {
    "id": "hip_circles_ccw",
    "name": "Hip Circles (Counter-Clockwise)",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Circle hips counter-clockwise."
    ],
    "techniqueNotes": "Mobility builder."
  },
  {
    "id": "high_knees_warmup_fast",
    "name": "High Knees",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Jog in place driving knees high."
    ],
    "techniqueNotes": "Increases heart rate."
  },
  {
    "id": "butt_kicks_warmup_fast",
    "name": "Butt Kicks",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Jog in place kicking glutes."
    ],
    "techniqueNotes": "Warms up hamstrings."
  },
  {
    "id": "leg_swings_fb",
    "name": "Leg Swings (Forward/Backward)",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Swing one leg forward and backward."
    ],
    "techniqueNotes": "Hip flexor/glute warmup."
  },
  {
    "id": "leg_swings_side",
    "name": "Leg Swings (Side-to-Side)",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Swing leg laterally across body."
    ],
    "techniqueNotes": "Adductor/abductor warmup."
  },
  {
    "id": "dynamic_lunges_alt",
    "name": "Dynamic Lunges",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Step forward into lunge, alternate legs."
    ],
    "techniqueNotes": "Lower body blood flow."
  },
  {
    "id": "cat_cow_dynamic",
    "name": "Cat-Cow Stretch (Dynamic)",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Move between arching and rounding back."
    ],
    "techniqueNotes": "Spinal lubrication."
  },
  {
    "id": "wrist_circles_warmup",
    "name": "Wrist Circles",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Rotate wrists in circles."
    ],
    "techniqueNotes": "Prepare wrists for presses."
  },
  {
    "id": "ankle_rotations_warmup",
    "name": "Ankle Rotations",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Rotate ankles in circles."
    ],
    "techniqueNotes": "Avoid ankle rolling."
  },
  {
    "id": "shoulder_shrugs_warmup",
    "name": "Shoulder Shrugs",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Roll shoulders up and back."
    ],
    "techniqueNotes": "Traps activation."
  },
  {
    "id": "jumping_jacks_warmup",
    "name": "Jumping Jacks",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Jump wide raising hands overhead."
    ],
    "techniqueNotes": "Full body warmup."
  },
  {
    "id": "inchworms_mobility",
    "name": "Inchworms",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Walk hands out to plank, then feet to hands."
    ],
    "techniqueNotes": "Hamstring and shoulder prep."
  },
  {
    "id": "walkouts_to_plank",
    "name": "Walkouts to Plank",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Stand, reach toes, walk hands to plank, walk back."
    ],
    "techniqueNotes": "Core and shoulder warmup."
  },
  {
    "id": "worlds_greatest_stretch_mobility",
    "name": "World's Greatest Stretch",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Deep lunge, rotate arm to ceiling, hamstring stretch."
    ],
    "techniqueNotes": "Full body joint prep."
  },
  {
    "id": "cossack_squats_bodyweight",
    "name": "Cossack Squats",
    "targetMuscleGroup": "Warm-up",
    "instructions": [
      "Squat side to side, straight leg heels up."
    ],
    "techniqueNotes": "Inner thigh flexibility."
  },
  {
    "id": "cobra_stretch_static",
    "name": "Cobra Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Lie down, press hands to lift chest."
    ],
    "techniqueNotes": "Stretch abdominals/lower back."
  },
  {
    "id": "childs_pose_static",
    "name": "Child's Pose",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Sit on heels, reach arms forward on floor."
    ],
    "techniqueNotes": "Lower back relaxation."
  },
  {
    "id": "lying_hamstring_stretch_static",
    "name": "Lying Hamstring Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Lie flat, raise one leg and pull closer."
    ],
    "techniqueNotes": "Deep hamstring stretch."
  },
  {
    "id": "standing_quad_stretch_static",
    "name": "Standing Quad Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Hold ankle behind glute standing."
    ],
    "techniqueNotes": "Front thigh stretch."
  },
  {
    "id": "chest_opener_stretch_static",
    "name": "Chest Opener Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Clasp hands behind back, lift arms."
    ],
    "techniqueNotes": "Pectoral opening."
  },
  {
    "id": "cross_arm_shoulder_stretch_static",
    "name": "Cross-Arm Shoulder Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Pull arm straight across chest."
    ],
    "techniqueNotes": "Deltoid release."
  },
  {
    "id": "butterfly_stretch_static",
    "name": "Butterfly Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Sit soles of feet together, knees down."
    ],
    "techniqueNotes": "Inner thigh opener."
  },
  {
    "id": "overhead_tricep_stretch_static",
    "name": "Overhead Tricep Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Pull elbow behind head downward."
    ],
    "techniqueNotes": "Tricep stretching."
  },
  {
    "id": "pigeon_pose_stretch",
    "name": "Pigeon Pose",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Fold forward over bent leg on floor."
    ],
    "techniqueNotes": "Glute and hip opener."
  },
  {
    "id": "calf_stretch_wall",
    "name": "Calf Stretch (Against Wall)",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Push wall, extend one calf back flat heel."
    ],
    "techniqueNotes": "Gastrocnemius stretch."
  },
  {
    "id": "seated_forward_fold",
    "name": "Seated Forward Fold",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Sit legs straight, reach to toes."
    ],
    "techniqueNotes": "Posterior chain stretch."
  },
  {
    "id": "standing_forward_fold_stretch",
    "name": "Standing Forward Fold",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Stand, fold torso to floor let arms hang."
    ],
    "techniqueNotes": "Spine decompression."
  },
  {
    "id": "lying_figure_four",
    "name": "Figure-Four Glute Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Lie down, cross ankle over knee, pull thigh."
    ],
    "techniqueNotes": "Piriformis release."
  },
  {
    "id": "cat_cow_hold",
    "name": "Cat-Cow Stretch (Hold)",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Hold cat pose, then cow pose for 15s."
    ],
    "techniqueNotes": "Deep spine stretch."
  },
  {
    "id": "sphinx_pose_stretch",
    "name": "Sphinx Pose",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Support chest on forearms lying down."
    ],
    "techniqueNotes": "Gentle lower spine curve."
  },
  {
    "id": "upward_facing_dog_stretch",
    "name": "Upward Facing Dog",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Lift thighs off floor supported by hands."
    ],
    "techniqueNotes": "Advanced back extension."
  },
  {
    "id": "thread_the_needle_stretch",
    "name": "Thread the Needle",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Kneeling, slide one arm under opposite shoulder."
    ],
    "techniqueNotes": "Thoracic spin rotation."
  },
  {
    "id": "wrist_extensor_stretch_static",
    "name": "Wrist Extensor Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Pull fingers back pointing down, palm away."
    ],
    "techniqueNotes": "Forearm flexor release."
  },
  {
    "id": "wrist_flexor_stretch_static",
    "name": "Wrist Flexor Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Pull fingers back pointing up, palm out."
    ],
    "techniqueNotes": "Forearm extensor release."
  },
  {
    "id": "side_bend_stretch_standing",
    "name": "Side Bend Stretch",
    "targetMuscleGroup": "Stretching",
    "instructions": [
      "Reach one hand over head bending to side."
    ],
    "techniqueNotes": "Lats and oblique stretch."
  },
  {
    "id": "running_treadmill",
    "name": "Running (Treadmill)",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Run on treadmill at desired pace."
    ],
    "techniqueNotes": "Heart health builder."
  },
  {
    "id": "running_outdoor",
    "name": "Running (Outdoor)",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Run outdoors on trail/road."
    ],
    "techniqueNotes": "Varying foot strikes."
  },
  {
    "id": "stationary_cycling_cardio",
    "name": "Stationary Cycling",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Cycle on stationary bike."
    ],
    "techniqueNotes": "Low impact cardiovascular."
  },
  {
    "id": "outdoor_cycling_cardio",
    "name": "Outdoor Cycling",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Ride bicycle outdoors."
    ],
    "techniqueNotes": "Road resistance."
  },
  {
    "id": "elliptical_trainer_cardio",
    "name": "Elliptical Trainer",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Use elliptical machine glide."
    ],
    "techniqueNotes": "Very low impact cardio."
  },
  {
    "id": "row_machine_cardio",
    "name": "Row Machine",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Perform rows on sliding machine."
    ],
    "techniqueNotes": "Full body cardiovascular."
  },
  {
    "id": "stair_climber_cardio",
    "name": "Stair Climber",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Step continuously on revolving stairs."
    ],
    "techniqueNotes": "High glute/quad cardio."
  },
  {
    "id": "jump_rope_double_under",
    "name": "Jump Rope (Double Under)",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Spin rope twice per single jump."
    ],
    "techniqueNotes": "Advanced speed/crossover."
  },
  {
    "id": "jump_rope_single_under",
    "name": "Jump Rope (Single Under)",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Spin rope once per jump."
    ],
    "techniqueNotes": "Classic endurance."
  },
  {
    "id": "burpees_cardio",
    "name": "Burpees",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Drop to push-up, jump up, repeat."
    ],
    "techniqueNotes": "High intensity HIIT."
  },
  {
    "id": "jumping_jacks_cardio",
    "name": "Jumping Jacks",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Jump hands high legs wide continuously."
    ],
    "techniqueNotes": "Simple warm-up/HIIT."
  },
  {
    "id": "kettlebell_swings_cardio",
    "name": "Kettlebell Swings",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Swing kettlebell to shoulder height using hips."
    ],
    "techniqueNotes": "Posterior chain cardio."
  },
  {
    "id": "shadow_boxing_cardio",
    "name": "Shadow Boxing",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Punch air while moving feet."
    ],
    "techniqueNotes": "Shoulders/cardio speed."
  },
  {
    "id": "swimming_cardio",
    "name": "Swimming",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Swim laps in pool."
    ],
    "techniqueNotes": "Perfect low-joint full body cardio."
  },
  {
    "id": "mountain_climbers_fast",
    "name": "Mountain Climbers (HIIT)",
    "targetMuscleGroup": "Cardio",
    "instructions": [
      "Run knees in plank quickly."
    ],
    "techniqueNotes": "Fast-paced core cardio."
  }
];
