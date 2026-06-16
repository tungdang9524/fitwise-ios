import { LibraryExercise } from '../models/fitness';

export const STATIC_EXERCISE_LIBRARY: LibraryExercise[] = [
  // --- WARM-UP (KHỞI ĐỘNG) ---
  {
    id: 'arm_circles',
    name: 'Arm Circles',
    targetMuscleGroup: 'Warm-up',
    instructions: [
      'Stand with feet shoulder-width apart and extend your arms straight out to the sides.',
      'Slowly make small circles with your arms in a clockwise motion.',
      'Gradually increase the size of the circles.',
      'Reverse the direction to counter-clockwise after 15-20 seconds.'
    ],
    techniqueNotes: 'Keep your shoulders down and relaxed, and engage your core slightly.'
  },
  {
    id: 'neck_rotations',
    name: 'Neck Rotations',
    targetMuscleGroup: 'Warm-up',
    instructions: [
      'Stand or sit upright with shoulders relaxed.',
      'Slowly tilt your head forward, bringing your chin towards your chest.',
      'Roll your head slowly in a circle to the right shoulder, backwards, to the left shoulder, and back to center.',
      'Repeat the circle in the opposite direction.'
    ],
    techniqueNotes: 'Move slowly and gently. Stop immediately if you feel any sharp pain or dizziness.'
  },
  {
    id: 'torso_twists',
    name: 'Torso Twists',
    targetMuscleGroup: 'Warm-up',
    instructions: [
      'Stand with your feet slightly wider than shoulder-width, knees slightly bent.',
      'Raise your hands to chest height, bending your elbows.',
      'Rotate your torso and hips slowly from side to side, letting your arms swing gently.',
      'Pivot on the back foot as you twist to protect your knees.'
    ],
    techniqueNotes: 'Keep your chest tall and do not force the twist beyond a comfortable range.'
  },
  {
    id: 'hip_circles',
    name: 'Hip Circles',
    targetMuscleGroup: 'Warm-up',
    instructions: [
      'Stand with your hands on your hips and feet wider than shoulder-width apart.',
      'Push your hips forward, then circle them wide to the right, backwards, to the left, and forward again.',
      'Make large, smooth circles.',
      'Repeat in the opposite direction.'
    ],
    techniqueNotes: 'Keep your knees slightly soft and move smoothly through the entire circle.'
  },
  {
    id: 'high_knees_warmup',
    name: 'High Knees (Warm-up)',
    targetMuscleGroup: 'Warm-up',
    instructions: [
      'Stand in place with your feet hip-width apart.',
      'Bring your right knee up toward your chest, then quickly lower it and bring your left knee up.',
      'Coordinate your arms as if you were running in place.',
      'Perform at a moderate pace to warm up the body.'
    ],
    techniqueNotes: 'Focus on landing softly on the balls of your feet and keeping your core braced.'
  },
  {
    id: 'butt_kicks_warmup',
    name: 'Butt Kicks (Warm-up)',
    targetMuscleGroup: 'Warm-up',
    instructions: [
      'Stand upright and start jogging in place.',
      'With each stride, bend your knee to lift your heel toward your glutes.',
      'Pump your arms naturally as you jog.'
    ],
    techniqueNotes: 'Keep your chest upright and do not lean too far forward.'
  },
  {
    id: 'leg_swings',
    name: 'Leg Swings',
    targetMuscleGroup: 'Warm-up',
    instructions: [
      'Stand near a wall or sturdy support for balance, holding it with one hand.',
      'Swing one leg forward and backward in a controlled, fluid motion.',
      'Repeat for 10-15 swings, then switch sides.',
      'Perform lateral swings (across your body) to warm up hip abductors.'
    ],
    techniqueNotes: 'Do not swing your leg so high that it arches your lower back. Control the motion.'
  },
  {
    id: 'dynamic_lunges',
    name: 'Dynamic Lunges',
    targetMuscleGroup: 'Warm-up',
    instructions: [
      'Stand tall with your feet hip-width apart.',
      'Take a controlled step forward with your right leg, lowering your hips until both knees are bent at about 90 degrees.',
      'Press through the right heel to push back up and return to standing.',
      'Alternate legs with each repetition.'
    ],
    techniqueNotes: 'Keep your front knee aligned directly over your ankle. Do not let it slide past your toes.'
  },

  // --- STRETCHING (GIÃN CƠ) ---
  {
    id: 'cobra_stretch',
    name: 'Cobra Stretch',
    targetMuscleGroup: 'Stretching',
    instructions: [
      'Lie face down on the floor with your hands flat under your shoulders.',
      'Keep your elbows tucked close to your body.',
      'Press your tops of feet and thighs firmly to the floor.',
      'Inhale and press your hands to lift your chest off the floor, keeping a slight bend in your elbows.',
      'Hold the stretch for 15-30 seconds while breathing deeply.'
    ],
    techniqueNotes: 'Do not squeeze your shoulders up towards your ears. Keep your neck long.'
  },
  {
    id: 'childs_pose',
    name: 'Child\'s Pose',
    targetMuscleGroup: 'Stretching',
    instructions: [
      'Kneel on the floor, bring your big toes together and sit on your heels.',
      'Separate your knees about hip-width apart.',
      'Exhale and lay your torso down between your thighs.',
      'Extend your arms forward on the floor, palms down, and rest your forehead on the mat.',
      'Hold for 30-60 seconds, relaxing your shoulders and back.'
    ],
    techniqueNotes: 'Breathe deeply into your lower back. If sitting on your heels is uncomfortable, place a cushion between your hips and heels.'
  },
  {
    id: 'hamstring_stretch_lying',
    name: 'Lying Hamstring Stretch',
    targetMuscleGroup: 'Stretching',
    instructions: [
      'Lie flat on your back with your legs extended.',
      'Raise one leg straight up, keeping the knee slightly bent.',
      'Grasp behind your thigh or calf with both hands and gently pull the leg towards your chest.',
      'Hold for 20-30 seconds, then release and repeat with the other leg.'
    ],
    techniqueNotes: 'Keep your lower back pressed to the floor. Do not pull on the back of the knee joint itself.'
  },
  {
    id: 'quad_stretch_standing',
    name: 'Standing Quad Stretch',
    targetMuscleGroup: 'Stretching',
    instructions: [
      'Stand tall, holding a wall or chair for balance if needed.',
      'Bend one knee and reach back to grasp your ankle with your hand.',
      'Gently pull your heel toward your glutes until you feel a stretch in the front of your thigh.',
      'Keep your knees tucked close together and stand straight.',
      'Hold for 20-30 seconds and switch legs.'
    ],
    techniqueNotes: 'Tuck your tailbone and keep your hips pushed slightly forward to deepen the stretch.'
  },
  {
    id: 'chest_opener_stretch',
    name: 'Chest Opener Stretch',
    targetMuscleGroup: 'Stretching',
    instructions: [
      'Stand tall with your feet hip-width apart.',
      'Interlace your fingers behind your lower back.',
      'Straighten your arms and gently lift your hands upward, pulling your shoulder blades together.',
      'Keep your chest high and hold the stretch for 15-30 seconds.'
    ],
    techniqueNotes: 'Keep your chin tucked and avoid arching your lower back.'
  },
  {
    id: 'shoulder_stretch_cross_arm',
    name: 'Cross-Arm Shoulder Stretch',
    targetMuscleGroup: 'Stretching',
    instructions: [
      'Bring your right arm straight across your chest.',
      'Hold it at the forearm or elbow with your left hand.',
      'Gently pull the arm in close to your body until you feel a stretch in the shoulder.',
      'Hold for 20-30 seconds, then switch sides.'
    ],
    techniqueNotes: 'Keep your shoulder dropped down, away from your ear.'
  },
  {
    id: 'butterfly_stretch',
    name: 'Butterfly Stretch',
    targetMuscleGroup: 'Stretching',
    instructions: [
      'Sit on the floor with your knees bent and the soles of your feet touching.',
      'Hold your feet or ankles and pull them in towards your groin.',
      'Keep your back flat and sit tall.',
      'Gently press your knees towards the floor using your elbows if comfortable.',
      'Hold for 30 seconds.'
    ],
    techniqueNotes: 'Do not bounce your knees. Maintain steady breathing and relax your hips.'
  },
  {
    id: 'tricep_stretch_overhead',
    name: 'Overhead Tricep Stretch',
    targetMuscleGroup: 'Stretching',
    instructions: [
      'Raise one arm overhead and bend the elbow, reaching your hand down your upper back.',
      'Use your other hand to gently pull your elbow inward and downward.',
      'Hold for 20 seconds, then repeat on the opposite side.'
    ],
    techniqueNotes: 'Stand straight and avoid leaning your head forward.'
  },

  // --- CARDIO ---
  {
    id: 'treadmill_running',
    name: 'Running (Treadmill)',
    targetMuscleGroup: 'Cardio',
    instructions: [
      'Step onto the treadmill, set a moderate speed, and start with a brisk walk.',
      'Increase the speed to a jogging or running pace.',
      'Maintain an upright posture and let your arms swing naturally.',
      'Cool down at a walking pace for 2-3 minutes at the end.'
    ],
    techniqueNotes: 'Land on the mid-foot rather than striking hard on the heel to reduce impact on your knees.'
  },
  {
    id: 'stationary_cycling',
    name: 'Stationary Cycling',
    targetMuscleGroup: 'Cardio',
    instructions: [
      'Adjust the seat height so there is a slight bend in your knee at the bottom of the pedal stroke.',
      'Sit tall, grip the handlebars lightly, and pedal at a steady cadence.',
      'Adjust the resistance level to match your fitness target.'
    ],
    techniqueNotes: 'Keep your knees pointing straight forward and avoid flaring them out to the sides.'
  },
  {
    id: 'elliptical_trainer',
    name: 'Elliptical Trainer',
    targetMuscleGroup: 'Cardio',
    instructions: [
      'Step onto the pedals and grip the moving handlebars.',
      'Begin pedaling forward with a smooth, gliding motion.',
      'Push and pull the handles to engage your upper body.',
      'Vary the incline and resistance to adjust intensity.'
    ],
    techniqueNotes: 'Keep your feet flat on the pedals and distribute your weight evenly.'
  },
  {
    id: 'jump_rope',
    name: 'Jump Rope',
    targetMuscleGroup: 'Cardio',
    instructions: [
      'Hold the jump rope handles with your hands at hip height, elbows close to your body.',
      'Rotate your wrists to swing the rope overhead.',
      'Jump just high enough to clear the rope, landing softly on the balls of your feet.'
    ],
    techniqueNotes: 'Keep your knees slightly soft and jump using your calves rather than bending your knees deeply.'
  },
  {
    id: 'burpees',
    name: 'Burpees',
    targetMuscleGroup: 'Cardio',
    instructions: [
      'Stand upright, then drop down into a squat and place your hands on the floor.',
      'Jump your feet back into a push-up plank position.',
      'Lower your chest to the floor, then press back up.',
      'Jump your feet forward back under your hips.',
      'Explode upward into a jump, reaching your hands overhead.'
    ],
    techniqueNotes: 'Brace your core to prevent your lower back from sagging in the plank position.'
  },
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    targetMuscleGroup: 'Cardio',
    instructions: [
      'Stand with your feet together and arms at your sides.',
      'Jump your feet out to the sides while bringing your hands together above your head.',
      'Jump back to the starting position immediately and repeat in a continuous rhythm.'
    ],
    techniqueNotes: 'Keep your knees slightly bent to absorb impact upon landing.'
  },

  // --- CHEST (NGỰC) ---
  {
    id: 'bench_press',
    name: 'Bench Press (Barbell)',
    targetMuscleGroup: 'Chest',
    instructions: [
      'Lie flat on a bench and grip the barbell slightly wider than shoulder-width.',
      'Unrack the bar and lower it slowly to your mid-chest.',
      'Push the bar back up powerfully until your arms are fully extended.'
    ],
    techniqueNotes: 'Keep your feet flat on the floor and retract your shoulder blades to protect your shoulders.'
  },
  {
    id: 'incline_bench_press',
    name: 'Incline Bench Press (Barbell)',
    targetMuscleGroup: 'Chest',
    instructions: [
      'Lie on an incline bench set to about 30-45 degrees.',
      'Unrack the barbell with a medium-wide grip and lower it to your upper chest.',
      'Press the bar straight up until your elbows lock, then repeat.'
    ],
    techniqueNotes: 'Keep your shoulders retracted and flat against the bench to maximize chest engagement.'
  },
  {
    id: 'dumbbell_bench_press',
    name: 'Dumbbell Bench Press',
    targetMuscleGroup: 'Chest',
    instructions: [
      'Sit on a flat bench with a dumbbell in each hand resting on your thighs.',
      'Lie back and position the dumbbells over your chest with your elbows bent 90 degrees.',
      'Press the dumbbells straight up over your chest, bringing them close together but not touching.',
      'Lower the weights slowly back to the starting position.'
    ],
    techniqueNotes: 'Focus on keeping a controlled descent; do not let the weights bounce at the bottom.'
  },
  {
    id: 'incline_dumbbell_press',
    name: 'Incline Dumbbell Bench Press',
    targetMuscleGroup: 'Chest',
    instructions: [
      'Lie back on an incline bench with dumbbells held at the sides of your chest.',
      'Press the weights straight up over your chest, contracting your pectorals.',
      'Lower the weights under control to the start position.'
    ],
    techniqueNotes: 'Keep the dumbbells moving in a slight arc, bringing them closer together at the top.'
  },
  {
    id: 'chest_fly_dumbbell',
    name: 'Chest Fly (Dumbbell)',
    targetMuscleGroup: 'Chest',
    instructions: [
      'Lie flat on a bench holding dumbbells above your chest, palms facing each other.',
      'With a slight bend in your elbows, lower your arms out to the sides in a wide arc.',
      'Squeeze your chest muscles to bring the dumbbells back to the starting position.'
    ],
    techniqueNotes: 'Avoid bending your elbows too much or lowering the dumbbells past shoulder level.'
  },
  {
    id: 'pushup',
    name: 'Push-up',
    targetMuscleGroup: 'Chest',
    instructions: [
      'Get into a high plank position with hands slightly wider than shoulder-width.',
      'Lower your body by bending your elbows until your chest nearly touches the floor.',
      'Push through your hands to extend your arms and return to the starting position.'
    ],
    techniqueNotes: 'Keep your body in a straight line from head to heels. Do not let your hips sag.'
  },
  {
    id: 'cable_crossover',
    name: 'Cable Crossover',
    targetMuscleGroup: 'Chest',
    instructions: [
      'Position pulleys at high level, grip handles, and step forward to create tension.',
      'Keep a slight bend in your elbows and bring your hands forward and down to meet in front of your waist.',
      'Slowly return to the starting position under control.'
    ],
    techniqueNotes: 'Keep your torso stable and perform the movement entirely with your arms and chest.'
  },

  // --- BACK (LƯNG) ---
  {
    id: 'deadlift',
    name: 'Deadlift (Barbell)',
    targetMuscleGroup: 'Back',
    instructions: [
      'Stand with feet mid-foot under the barbell.',
      'Bend over and grab the bar with a shoulder-width grip.',
      'Keep your back flat, hinge at the hips, and stand up straight lifting the bar along your shins.'
    ],
    techniqueNotes: 'Engage your core and maintain a neutral spine. Do not round your lower back under weight.'
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown (Cable)',
    targetMuscleGroup: 'Back',
    instructions: [
      'Sit at a pulldown station and grip the bar slightly wider than shoulder-width.',
      'Pull the bar down toward your upper chest, squeezing your shoulder blades together.',
      'Extend your arms slowly to return the bar to the starting position.'
    ],
    techniqueNotes: 'Avoid leaning back excessively to pull the weight; focus on pulling with your elbows.'
  },
  {
    id: 'barbell_row',
    name: 'Bent-Over Row (Barbell)',
    targetMuscleGroup: 'Back',
    instructions: [
      'Hold a barbell with a shoulder-width grip, hinge at your hips, and lean forward with a flat back.',
      'Pull the bar to your lower ribcage, squeezing your shoulder blades at the top.',
      'Lower the bar slowly back to the starting hanging position.'
    ],
    techniqueNotes: 'Keep your knees slightly bent and ensure your back remains flat throughout the lift.'
  },
  {
    id: 'dumbbell_row_one_arm',
    name: 'One-Arm Dumbbell Row',
    targetMuscleGroup: 'Back',
    instructions: [
      'Place one knee and same-side hand flat on a bench, keeping your back parallel to the ground.',
      'Hold a dumbbell in your opposite hand, extending your arm towards the floor.',
      'Pull the dumbbell up to your hip, keeping your elbow tucked close to your torso.',
      'Lower the dumbbell under control.'
    ],
    techniqueNotes: 'Do not twist your shoulders or hips to swing the weight up.'
  },
  {
    id: 'seated_cable_row',
    name: 'Seated Cable Row',
    targetMuscleGroup: 'Back',
    instructions: [
      'Sit at a cable row station, place feet on the platform, and grab the V-bar attachment.',
      'Keep your back straight, pull the handle toward your abdomen while pulling your elbows back.',
      'Slowly extend your arms back to the starting position.'
    ],
    techniqueNotes: 'Avoid rocking your torso back and forth. Keep your upper body stationary.'
  },
  {
    id: 'pullup',
    name: 'Pull-Up',
    targetMuscleGroup: 'Back',
    instructions: [
      'Grasp a pull-up bar with an overhand grip (palms facing away), wider than shoulder-width.',
      'Pull your chest up towards the bar by driving your elbows down towards your ribs.',
      'Lower yourself slowly and fully extend your arms.'
    ],
    techniqueNotes: 'Engage your core to prevent swinging. Focus on pulling with your back, not just your arms.'
  },
  {
    id: 'chinup',
    name: 'Chin-Up',
    targetMuscleGroup: 'Back',
    instructions: [
      'Grasp a pull-up bar with an underhand grip (palms facing you), shoulder-width apart.',
      'Pull your chin over the bar, keeping your elbows close to your chest.',
      'Lower yourself back down under control to a dead hang.'
    ],
    techniqueNotes: 'Chin-ups place a higher emphasis on the biceps than traditional pull-ups.'
  },

  // --- LEGS (ĐÙI/CHÂN) ---
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
    id: 'goblet_squat',
    name: 'Goblet Squat (Dumbbell)',
    targetMuscleGroup: 'Legs',
    instructions: [
      'Hold a dumbbell vertically by one end against your chest.',
      'Stand with feet shoulder-width apart and toes flared slightly outwards.',
      'Squat down deeply, keeping your back flat and chest upright.',
      'Drive through your heels to return to standing.'
    ],
    techniqueNotes: 'Keep the weight tucked tight against your body throughout the entire movement.'
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    targetMuscleGroup: 'Legs',
    instructions: [
      'Sit in the leg press machine and place your feet shoulder-width apart on the sled platform.',
      'Lower the safety locks and bend your knees to lower the platform towards your chest (90 degrees).',
      'Push the sled away by extending your legs, without locking your knees at the top.'
    ],
    techniqueNotes: 'Never lock your knees out completely at the top of the movement; keep them slightly bent.'
  },
  {
    id: 'romanian_deadlift_barbell',
    name: 'Romanian Deadlift (Barbell)',
    targetMuscleGroup: 'Legs',
    instructions: [
      'Stand with feet hip-width apart, holding a barbell in front of your thighs.',
      'Keep your back flat, hinge at your hips, and slide the bar down your legs while pushing your hips back.',
      'Lower the bar until you feel a stretch in your hamstrings, then squeeze your glutes to stand up.'
    ],
    techniqueNotes: 'Keep the bar close to your body and maintain a neutral spine. Do not round your back.'
  },
  {
    id: 'leg_extension_machine',
    name: 'Leg Extension',
    targetMuscleGroup: 'Legs',
    instructions: [
      'Sit on the leg extension machine, securing your shins behind the padded bar.',
      'Grip the handles at your sides to anchor your hips.',
      'Extend your legs fully to lift the weight, holding the contraction briefly at the top.',
      'Lower the weight slowly to the starting position.'
    ],
    techniqueNotes: 'Keep your toes pointed straight ahead or slightly outwards. Do not swing the weight up.'
  },
  {
    id: 'leg_curl_machine',
    name: 'Lying Leg Curl',
    targetMuscleGroup: 'Legs',
    instructions: [
      'Lie face down on the leg curl machine, positioning the roller pads just below your calf muscles.',
      'Grip the handles and curl your heels up towards your glutes as far as possible.',
      'Slowly lower your legs back to the starting position.'
    ],
    techniqueNotes: 'Keep your hips pressed firmly against the pad; do not let your lower back arch excessively.'
  },
  {
    id: 'dumbbell_lunge',
    name: 'Dumbbell Lunge',
    targetMuscleGroup: 'Legs',
    instructions: [
      'Hold a dumbbell in each hand at your sides, standing with feet hip-width apart.',
      'Step forward with one foot and lower your hips until both knees are bent at 90 degrees.',
      'Push off the front foot to return to the starting position.',
      'Repeat on the opposite leg.'
    ],
    techniqueNotes: 'Ensure your front knee is aligned with your ankle, not drifting past your toes.'
  },
  {
    id: 'bulgarian_split_squat',
    name: 'Bulgarian Split Squat',
    targetMuscleGroup: 'Legs',
    instructions: [
      'Stand about two feet in front of a bench, holding dumbbells at your sides.',
      'Place the top of your back foot flat on the bench behind you.',
      'Lower your hips until your back knee is just above the floor and front thigh is parallel.',
      'Drive through your front heel to stand up.'
    ],
    techniqueNotes: 'Maintain an upright torso. Adjust your distance from the bench to find a comfortable balance.'
  },

  // --- SHOULDERS (VAI) ---
  {
    id: 'overhead_press',
    name: 'Overhead Press (Barbell)',
    targetMuscleGroup: 'Shoulders',
    instructions: [
      'Hold a barbell at shoulder height with palms facing forward.',
      'Press the bar straight overhead by extending your arms and locking your elbows.',
      'Lower the bar back down under control to shoulder height.'
    ],
    techniqueNotes: 'Squeeze your glutes and brace your core to prevent excessive arching in your lower back.'
  },
  {
    id: 'dumbbell_shoulder_press',
    name: 'Dumbbell Shoulder Press',
    targetMuscleGroup: 'Shoulders',
    instructions: [
      'Sit on a bench with a back support, holding dumbbells at shoulder level with an overhand grip.',
      'Press the dumbbells straight up overhead until your arms are fully extended.',
      'Lower the weights slowly back to shoulder height.'
    ],
    techniqueNotes: 'Do not arch your back off the bench. Keep your wrists aligned over your elbows.'
  },
  {
    id: 'lateral_raise_dumbbell',
    name: 'Dumbbell Lateral Raise',
    targetMuscleGroup: 'Shoulders',
    instructions: [
      'Stand with dumbbells at your sides, knees slightly bent, and core engaged.',
      'With elbows slightly bent, raise your arms out to the sides until they are parallel to the floor.',
      'Lower the dumbbells slowly back to your sides.'
    ],
    techniqueNotes: 'Lead the movement with your elbows and avoid swinging your body to gain momentum.'
  },
  {
    id: 'front_raise_dumbbell',
    name: 'Dumbbell Front Raise',
    targetMuscleGroup: 'Shoulders',
    instructions: [
      'Stand tall holding dumbbells in front of your thighs, palms facing your legs.',
      'Raise one dumbbell straight in front of you to shoulder level, keeping the arm straight.',
      'Lower the dumbbell under control, then repeat with the other arm.'
    ],
    techniqueNotes: 'Focus on keeping your shoulders relaxed and down. Do not shrug.'
  },
  {
    id: 'rear_delt_fly_dumbbell',
    name: 'Dumbbell Rear Delt Fly',
    targetMuscleGroup: 'Shoulders',
    instructions: [
      'Hinge at your hips and bend forward until your torso is nearly parallel to the floor, holding dumbbells.',
      'With a slight bend in your elbows, raise the weights out to your sides, squeezing your rear delts.',
      'Lower the weights under control back to the starting point.'
    ],
    techniqueNotes: 'Keep your neck in a neutral position by looking at the floor slightly in front of you.'
  },
  {
    id: 'arnold_press',
    name: 'Arnold Press (Dumbbell)',
    targetMuscleGroup: 'Shoulders',
    instructions: [
      'Sit on a bench holding dumbbells at chest height, palms facing towards you.',
      'Press the weights overhead while rotating your wrists so that your palms face forward at the top.',
      'Lower the dumbbells back down, reversing the rotation back to the start.'
    ],
    techniqueNotes: 'Perform the press and rotation in one continuous, smooth movement.'
  },

  // --- ARMS (TAY) ---
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
    id: 'barbell_curl',
    name: 'Barbell Bicep Curl',
    targetMuscleGroup: 'Arms',
    instructions: [
      'Stand tall holding a barbell with an underhand grip, shoulder-width apart.',
      'Curl the barbell up towards your chest, keeping your elbows fixed at your sides.',
      'Lower the bar slowly under control to full extension.'
    ],
    techniqueNotes: 'Avoid leaning back to swing the bar up; keep your posture steady.'
  },
  {
    id: 'hammer_curl_dumbbell',
    name: 'Dumbbell Hammer Curl',
    targetMuscleGroup: 'Arms',
    instructions: [
      'Hold dumbbells at your sides with neutral grip (palms facing each other).',
      'Curl the dumbbells up towards your shoulders without rotating your wrists.',
      'Lower the weights back to the start.'
    ],
    techniqueNotes: 'This target the brachioradialis and brachialis muscles in the forearms and outer biceps.'
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
    id: 'overhead_tricep_extension_dumbbell',
    name: 'Dumbbell Overhead Tricep Extension',
    targetMuscleGroup: 'Arms',
    instructions: [
      'Sit or stand upright holding a single dumbbell with both hands vertically overhead.',
      'Lower the weight behind your head by bending your elbows, keeping your upper arms vertical.',
      'Press the dumbbell back up overhead by extending your elbows.'
    ],
    techniqueNotes: 'Keep your elbows pointing forward, not flaring out to the sides.'
  },
  {
    id: 'skull_crusher_ezbar',
    name: 'Skull Crusher (EZ Bar)',
    targetMuscleGroup: 'Arms',
    instructions: [
      'Lie on a flat bench, holding an EZ bar overhead with arms extended straight up.',
      'Bend at your elbows to lower the bar towards your forehead, keeping your upper arms stationary.',
      'Extend your elbows to press the bar back up to the starting position.'
    ],
    techniqueNotes: 'Keep your elbows tucked in and pointed forward. Do not let them flare outwards.'
  },
  {
    id: 'tricep_dips',
    name: 'Tricep Dips (Bench)',
    targetMuscleGroup: 'Arms',
    instructions: [
      'Sit on the edge of a bench and place your hands flat next to your hips.',
      'Step your feet forward and lift your hips off the bench.',
      'Lower your hips by bending your elbows to 90 degrees, keeping your back close to the bench.',
      'Push through your palms to return to the starting position.'
    ],
    techniqueNotes: 'Do not drop your hips too low to avoid excessive shoulder strain.'
  },

  // --- CORE (BỤNG/CƠ TRUNG TÂM) ---
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
  },
  {
    id: 'abdominal_crunch',
    name: 'Abdominal Crunch',
    targetMuscleGroup: 'Core',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place your hands lightly behind your head or crossed over your chest.',
      'Contract your abs to lift your shoulders off the floor, keeping your lower back pressed down.',
      'Lower your shoulders back down slowly.'
    ],
    techniqueNotes: 'Do not pull on your neck with your hands; lift using your abdominal muscles.'
  },
  {
    id: 'plank_standard',
    name: 'Standard Plank',
    targetMuscleGroup: 'Core',
    instructions: [
      'Place your forearms on the floor, elbows aligned under your shoulders.',
      'Extend your legs straight behind you, supporting your weight on your toes.',
      'Keep your body in a straight line from head to heels.',
      'Hold the position while maintaining deep, regular breathing.'
    ],
    techniqueNotes: 'Squeeze your glutes and pull your belly button towards your spine to engage the deep core.'
  },
  {
    id: 'russian_twist',
    name: 'Russian Twist',
    targetMuscleGroup: 'Core',
    instructions: [
      'Sit on the floor with knees bent, lift your feet slightly, and lean back at a 45-degree angle.',
      'Hold your hands together at your chest (or hold a weight).',
      'Twist your torso to the right, touching the floor next to your hip, then twist to the left.'
    ],
    techniqueNotes: 'Keep your spine flat and pull your shoulders back. Do not slouch.'
  },
  {
    id: 'ab_wheel_rollout',
    name: 'Ab Wheel Rollout',
    targetMuscleGroup: 'Core',
    instructions: [
      'Kneel on the floor holding the ab wheel handles.',
      'Roll the wheel forward, extending your body until your torso is close to the floor.',
      'Squeeze your abs and roll the wheel back to the starting kneeling position.'
    ],
    techniqueNotes: 'Maintain a slightly rounded lower back and tight core. Do not let your back arch or sag.'
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    targetMuscleGroup: 'Core',
    instructions: [
      'Start in a push-up plank position.',
      'Drive one knee forward under your chest, then quickly switch legs in a running motion.',
      'Keep your hips low and body in alignment.'
    ],
    techniqueNotes: 'Avoid raising your hips too high; maintain a solid flat plank stance.'
  },
  {
    id: 'bicycle_crunch',
    name: 'Bicycle Crunch',
    targetMuscleGroup: 'Core',
    instructions: [
      'Lie on your back, knees bent, hands behind your head.',
      'Raise your shoulder blades off the floor and lift your feet.',
      'Twist your torso to touch your right elbow to your left knee while extending your right leg straight.',
      'Switch sides, touching left elbow to right knee.'
    ],
    techniqueNotes: 'Move slowly and focus on twisting from the ribs, not just pulling your elbows.'
  }
];
