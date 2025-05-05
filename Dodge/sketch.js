let player, yellowCircles = [], blueCircles = [], whiteCircles = [], purpleCircles = [], 
    orangeCircles = [], greenCircles = [], cyanPairs = [], indigoTriangles = [], 
    startTime, playerScore = 0, highScore = 15284, menuMusic, gameMusic = [], 
    currentGameMusic, lastScoreUpdate = 0, gameState = 'start', 
    startButton, againButton, menuSquares = [];

const YELLOW_SPEED = 3;

// Preload music files
function preload() {
  menuMusic = loadSound('demon gummies.mp3');
  gameMusic = [
    loadSound('KuroSe.mp3'),
    loadSound('Alex Peipman.mp3'),
    loadSound('Machine Girl.mp3')
  ];
}

// Music control functions
const musicController = {
  playMenu() {
    this.stopGame();
    if (!menuMusic.isPlaying()) {
      try {
        menuMusic.loop();
      } catch (e) {
        console.error("Error playing menu music:", e);
      }
    }
  },
  
  playGame() {
    if (menuMusic.isPlaying()) menuMusic.stop();
    this.stopGame();
    currentGameMusic = gameMusic[floor(random(gameMusic.length))];
    currentGameMusic.loop();
  },
  
  stopGame() {
    gameMusic.forEach(track => { if (track.isPlaying()) track.stop(); });
  }
};

function setup() {
  createCanvas(800, 600);
  
  // UI elements
  startButton = {x: width/2-75, y: height/2+30, width: 150, height: 50, label: "START"};
  againButton = {x: width/2-75, y: height/2+80, width: 150, height: 50, label: "AGAIN?"};
  
  // Create menu animations
  for (let i = 0; i < 5; i++) {
    menuSquares.push({
      x: random(width), y: random(height), size: random(100, 180),
      vx: random(0.5, 1.5) * (random() > 0.5 ? 1 : -1),
      vy: random(0.5, 1.5) * (random() > 0.5 ? 1 : -1)
    });
  }
  
  resetGame();
  musicController.playMenu();
}

function resetGame() {
  // Clear all arrays
  yellowCircles = []; blueCircles = []; whiteCircles = [];
  purpleCircles = []; orangeCircles = []; greenCircles = [];
  cyanPairs = []; indigoTriangles = [];
  
  // Reset player
  player = {x: width/2, y: height/2, size: 5.25, speed: 5};
  
  // Reset score
  playerScore = 0;
  lastScoreUpdate = 0;
}

function startGame() {
  gameState = 'playing';
  startTime = millis();
  loop();
  
  musicController.playGame();

  // Schedule all spawners with staggered starts
  scheduleNextYellow();
  setTimeout(scheduleNextBlue, 30000);   // blue after 30s
  setTimeout(scheduleNextPurple, 50000); // purple after 50s
  setTimeout(scheduleNextOrange, 25000); // orange after 25s
  setTimeout(scheduleNextGreen, 100000); // green after 100s
  setTimeout(scheduleNextCyan, 70000);   // cyan after 70s
  setTimeout(scheduleNextIndigo, 85000); // indigo after 85s
}

function draw() {
  background(0);
  const thisMoment = millis();
  
  if (gameState === 'start') {
    updateMenuSquares();
    drawStartScreen();
  } 
  else if (gameState === 'playing') {
    handlePlayer();
    drawPlayer();
    
    // Check if player is near any obstacle
    if (isNearObstacle()) {
      playerScore++;
      if (playerScore > highScore) highScore = playerScore;
    }
    
    // Display scores
    displayScores();
    
    // Handle all game objects
    updateYellowCircles(thisMoment);
    updateOrangeCircles(thisMoment);
    updateBlueCircles(thisMoment);
    updateWhiteCircles(thisMoment);
    updatePurpleCircles(thisMoment);
    updateGreenCircles(thisMoment);
    updateCyanPairs(thisMoment);
    updateIndigoTriangles(thisMoment);
  } 
  else if (gameState === 'gameover') {
    drawGameOverScreen();
  }
}

// Check if player is near any obstacle (for score)
function isNearObstacle() {
  // Check distance to all obstacles
  const objects = [
    {arr: yellowCircles, dist: 50},
    {arr: blueCircles, dist: 50},
    {arr: whiteCircles, dist: 50},
    {arr: purpleCircles, dist: 50},
    {arr: orangeCircles, dist: 50},
    {arr: greenCircles, dist: 50}
  ];
  
  // Check regular circular objects
  for (const obj of objects) {
    for (const item of obj.arr) {
      if (dist(player.x, player.y, item.x, item.y) < obj.dist + item.r) {
        return true;
      }
    }
  }
  
  // Check cyan pairs
  for (const pair of cyanPairs) {
    if (dist(player.x, player.y, pair.p1.x, pair.p1.y) < 50 || 
        dist(player.x, player.y, pair.p2.x, pair.p2.y) < 50) {
      return true;
    }
  }
  
  // Check indigo triangles
  for (const it of indigoTriangles) {
    const age = millis() - it.birth;
    const growthFactor = age < 3000 ? 1 + (age / 3000) * 5.5 : 6.5;
    const size = it.baseSize * growthFactor;
    if (dist(player.x, player.y, it.x, it.y) < 50 + size) {
      return true;
    }
  }
  
  return false;
}

// Update and display menu squares
function updateMenuSquares() {
  menuSquares.forEach(sq => {
    // Update position
    sq.x += sq.vx;
    sq.y += sq.vy;
    
    // Bounce off edges
    if (sq.x < 0 || sq.x > width) sq.vx *= -1;
    if (sq.y < 0 || sq.y > height) sq.vy *= -1;
    
    // Draw square
    noFill();
    stroke(0, 191, 255);
    strokeWeight(2);
    rectMode(CENTER);
    rect(sq.x, sq.y, sq.size, sq.size);
  });
}

// Display scores
function displayScores() {
  textAlign(LEFT, TOP);
  textSize(12);
  fill(255);
  text("Your Score: " + playerScore, 20, 20);
  
  textAlign(RIGHT, TOP);
  text("High Score: " + highScore, width - 20, 20);
}

// Update yellow circles
function updateYellowCircles(thisMoment) {
  for (let i = yellowCircles.length - 1; i >= 0; i--) {
    const yc = yellowCircles[i];
    
    // Update position
    yc.x += yc.vx;
    yc.y += yc.vy;

    // Bounce off walls
    if (yc.x < yc.r || yc.x > width - yc.r) { yc.vx *= -1; flash(yc); }
    if (yc.y < yc.r || yc.y > height - yc.r) { yc.vy *= -1; flash(yc); }

    // Check for collision with player
    if (collides(player.x, player.y, player.size/2, yc.x, yc.y, yc.r)) gameOver();

    // Draw circle
    noStroke();
    fill(yc.flash ? color(255, 0, 0) : color(255, 255, 0));
    ellipse(yc.x, yc.y, yc.r * 2);

    // Remove if lifetime expired
    if (thisMoment - yc.birth > yc.lifespan) {
      yellowCircles.splice(i, 1);
    }
  }
}

// Update orange circles
function updateOrangeCircles(thisMoment) {
  for (let i = orangeCircles.length - 1; i >= 0; i--) {
    const oc = orangeCircles[i];
    
    // Update position
    oc.x += oc.vx;
    oc.y += oc.vy;

    // Bounce off walls and spawn yellow
    if (oc.x < oc.r || oc.x > width - oc.r) { 
      oc.vx *= -1; 
      flash(oc); 
      spawnYellowAt(oc.x, oc.y); 
    }
    if (oc.y < oc.r || oc.y > height - oc.r) { 
      oc.vy *= -1; 
      flash(oc); 
      spawnYellowAt(oc.x, oc.y); 
    }

    // Check for collision with player
    if (collides(player.x, player.y, player.size/2, oc.x, oc.y, oc.r)) gameOver();

    // Draw circle
    noStroke();
    fill(oc.flash ? color(255, 0, 0) : color(255, 165, 0));
    ellipse(oc.x, oc.y, oc.r * 2);

    // Remove if lifetime expired
    if (thisMoment - oc.birth > 15600) {
      orangeCircles.splice(i, 1);
    }
  }
}

// Update blue circles
function updateBlueCircles(thisMoment) {
  for (let i = blueCircles.length - 1; i >= 0; i--) {
    const bc = blueCircles[i];
    
    // Draw circle
    noStroke();
    fill(0, 0, 139);
    ellipse(bc.x, bc.y, bc.r * 2);

    // Check for spawn time
    if (!bc.spawned && thisMoment > bc.spawnTime + 1500) {
      // Spawn white circles
      for (let j = 0; j < 10; j++) {
        const angle = random(TWO_PI);
        whiteCircles.push({
          x: bc.x, y: bc.y, r: 4.2,
          vx: cos(angle) * bc.whiteSpeed,
          vy: sin(angle) * bc.whiteSpeed,
          birth: thisMoment
        });
      }
      bc.spawned = true;
      bc.deathTime = thisMoment;
    }

    // Remove if lifetime expired
    if (bc.spawned && thisMoment > bc.deathTime) {
      blueCircles.splice(i, 1);
      scheduleNextBlue();
    }

    // Check for collision with player
    if (collides(player.x, player.y, player.size/2, bc.x, bc.y, bc.r)) gameOver();
  }
}

// Update white circles
function updateWhiteCircles(thisMoment) {
  for (let i = whiteCircles.length - 1; i >= 0; i--) {
    const wc = whiteCircles[i];
    
    // Update position
    wc.x += wc.vx;
    wc.y += wc.vy;

    // Bounce off walls
    if (wc.x < wc.r || wc.x > width - wc.r) wc.vx *= -1;
    if (wc.y < wc.r || wc.y > height - wc.r) wc.vy *= -1;

    // Draw circle
    noStroke();
    fill(255);
    ellipse(wc.x, wc.y, wc.r * 2);

    // Check for collision with player
    if (collides(player.x, player.y, player.size/2, wc.x, wc.y, wc.r)) gameOver();
    
    // Remove if lifetime expired
    if (thisMoment - wc.birth > 2400) whiteCircles.splice(i, 1);
  }
}

// Update purple circles
function updatePurpleCircles(thisMoment) {
  for (let i = purpleCircles.length - 1; i >= 0; i--) {
    const pc = purpleCircles[i];
    const age = thisMoment - pc.birth;
    
    if (age < pc.duration) {
      // Home in on player
      const angle = atan2(player.y - pc.y, player.x - pc.x);
      pc.vx = cos(angle) * player.speed * 0.42;
      pc.vy = sin(angle) * player.speed * 0.42;
      pc.x += pc.vx;
      pc.y += pc.vy;

      // Draw circle
      noStroke();
      fill(128, 0, 128);
      ellipse(pc.x, pc.y, pc.r * 2);
      
      // Check for collision with player
      if (collides(player.x, player.y, player.size/2, pc.x, pc.y, pc.r)) gameOver();
    } else {
      purpleCircles.splice(i, 1);
    }
  }
}

// Update green circles
function updateGreenCircles(thisMoment) {
  for (let i = greenCircles.length - 1; i >= 0; i--) {
    const gc = greenCircles[i];
    
    // Draw circle
    noStroke();
    fill(0, 255, 0);
    ellipse(gc.x, gc.y, gc.r * 2);

    // Check for spawn time
    if (!gc.spawned && thisMoment > gc.spawnTime + 1500) {
      // Spawn orange circles
      for (let j = 0; j < 8; j++) {
        spawnOrangeAt(gc.x, gc.y);
      }
      gc.spawned = true;
      gc.deathTime = thisMoment;
    }

    // Remove if lifetime expired
    if (gc.spawned && thisMoment > gc.deathTime) {
      greenCircles.splice(i, 1);
      scheduleNextGreen();
    }

    // Check for collision with player
    if (collides(player.x, player.y, player.size/2, gc.x, gc.y, gc.r)) gameOver();
  }
}

// Update cyan pairs
function updateCyanPairs(thisMoment) {
  for (let i = cyanPairs.length - 1; i >= 0; i--) {
    const pair = cyanPairs[i];
    const age = thisMoment - pair.birth;
    
    if (age < 20000) {
      // Draw triangles
      fill(0, 255, 255);
      noStroke();
      triangle(
        pair.p1.x, pair.p1.y - 10,
        pair.p1.x - 8, pair.p1.y + 5,
        pair.p1.x + 8, pair.p1.y + 5
      );
      triangle(
        pair.p2.x, pair.p2.y - 10,
        pair.p2.x - 8, pair.p2.y + 5,
        pair.p2.x + 8, pair.p2.y + 5
      );
      
      // Draw connecting line
      stroke(0, 255, 255);
      strokeWeight(2);
      line(pair.p1.x, pair.p1.y, pair.p2.x, pair.p2.y);
      noStroke();

      // Check collision with line segment
      const d = distToSegment(
        {x: player.x, y: player.y},
        pair.p1,
        pair.p2
      );
      if (d < player.size / 2) {
        // Remove pair and spawn blue circles
        cyanPairs.splice(i, 1);
        spawnBlueAt(pair.p1.x, pair.p1.y);
        spawnBlueAt(pair.p2.x, pair.p2.y);
      }
    } else {
      cyanPairs.splice(i, 1);
    }
  }
}

// Update indigo triangles
function updateIndigoTriangles(thisMoment) {
  for (let i = indigoTriangles.length - 1; i >= 0; i--) {
    const it = indigoTriangles[i];
    const age = thisMoment - it.birth;
    
    if (age < 15000) {
      // Calculate growth factor
      const growthFactor = age < 3000 ? 1 + (age / 3000) * 5.5 : 6.5;
      const size = it.baseSize * growthFactor;
      const rotationAngle = (TWO_PI * age / 4000) % TWO_PI;
      
      // Draw triangle
      stroke(238, 130, 238);
      strokeWeight(2);
      fill(75, 0, 130);
      
      push();
      translate(it.x, it.y);
      rotate(rotationAngle);
      triangle(
        0, -size,
        -size * 0.866, size * 0.5,
        size * 0.866, size * 0.5
      );
      pop();
      noStroke();
      
      // Check collisions with other objects
      const checkArrays = [yellowCircles, blueCircles, whiteCircles, 
                          purpleCircles, orangeCircles, greenCircles];
      
      checkArrays.forEach(arr => {
        arr.forEach(obj => {
          if (triangleCircleCollision(it, size, obj)) {
            teleportObject(obj);
          }
        });
      });
      
      // Check player collision
      if (triangleCircleCollision(it, size, {x: player.x, y: player.y, r: player.size/2})) {
        gameOver();
      }
    } else {
      // Spawn purple when expired
      spawnPurpleAt(it.x, it.y);
      indigoTriangles.splice(i, 1);
    }
  }
}

// Spawner scheduling functions
function scheduleNextYellow() {
  setTimeout(() => { 
    spawnYellow(); 
    scheduleNextYellow(); 
  }, random(2000, 4000));
}

function scheduleNextBlue() {
  setTimeout(() => { 
    blueCircles.push({ 
      x: random(width), 
      y: random(height), 
      r: 7.875, 
      spawnTime: millis(), 
      spawned: false, 
      whiteSpeed: 6 
    }); 
  }, random(6000, 12000));
}

function scheduleNextPurple() {
  setTimeout(() => { 
    spawnPurple(); 
    scheduleNextPurple(); 
  }, random(18450, 23075));
}

function scheduleNextOrange() {
  setTimeout(() => { 
    spawnOrange(); 
    scheduleNextOrange(); 
  }, random(15000, 25000));
}

function scheduleNextGreen() {
  setTimeout(() => {
    greenCircles.push({ 
      x: random(width), 
      y: random(height), 
      r: 11.8125, 
      spawnTime: millis(), 
      spawned: false 
    });
    scheduleNextGreen();
  }, random(20000, 30000));
}

function scheduleNextCyan() {
  setTimeout(() => {
    spawnCyanPair();
    scheduleNextCyan();
  }, random(25000, 40000));
}

function scheduleNextIndigo() {
  setTimeout(() => {
    spawnIndigo();
    scheduleNextIndigo();
  }, random(25000, 45000));
}

// Spawn functions
function spawnYellow() {
  const angle = random(TWO_PI);
  yellowCircles.push({ 
    x: random(width), 
    y: random(height), 
    r: 5.25,
    vx: cos(angle) * YELLOW_SPEED, 
    vy: sin(angle) * YELLOW_SPEED, 
    birth: millis(), 
    lifespan: random(33600, 50400),
    flash: false 
  });
}

function spawnYellowAt(x, y) {
  const angle = random(TWO_PI);
  yellowCircles.push({ 
    x, y, r: 5.25,
    vx: cos(angle) * YELLOW_SPEED, 
    vy: sin(angle) * YELLOW_SPEED, 
    birth: millis(), 
    lifespan: random(33600, 50400),
    flash: false 
  });
}

function spawnPurple() {
  purpleCircles.push({ 
    x: random(width), 
    y: random(height), 
    r: 5.25, 
    birth: millis(), 
    duration: 5000 
  });
}

function spawnPurpleAt(x, y) {
  purpleCircles.push({ 
    x, y, r: 5.25, 
    birth: millis(), 
    duration: 5000 
  });
}

function spawnOrange() {
  const angle = random(TWO_PI);
  orangeCircles.push({ 
    x: random(width), 
    y: random(height), 
    r: 5.25, 
    vx: cos(angle) * YELLOW_SPEED, 
    vy: sin(angle) * YELLOW_SPEED, 
    birth: millis(), 
    flash: false 
  });
}

function spawnOrangeAt(x, y) {
  const angle = random(TWO_PI);
  orangeCircles.push({ 
    x, y, r: 5.25, 
    vx: cos(angle) * YELLOW_SPEED, 
    vy: sin(angle) * YELLOW_SPEED, 
    birth: millis(), 
    flash: false 
  });
}

function spawnBlueAt(x, y) {
  blueCircles.push({ 
    x, y, r: 7.875, 
    spawnTime: millis(), 
    spawned: false, 
    whiteSpeed: 6 
  });
}

function spawnCyanPair() {
  // Pick first point randomly
  const x1 = random(width);
  const y1 = random(height);
  
  // Pick second point at least 600 away
  const angle = random(TWO_PI);
  const x2 = constrain(x1 + cos(angle) * 600, 0, width);
  const y2 = constrain(y1 + sin(angle) * 600, 0, height);
  
  cyanPairs.push({
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
    birth: millis()
  });
}

function spawnIndigo() {
  indigoTriangles.push({
    x: random(width),
    y: random(height),
    baseSize: 10.5,
    birth: millis()
  });
}

// Helper functions
function distToSegment(pt, v, w) {
  // Distance from point to line segment
  const l2 = sq(dist(v.x, v.y, w.x, w.y));
  if (l2 === 0) return dist(pt.x, pt.y, v.x, v.y);
  
  let t = ((pt.x - v.x) * (w.x - v.x) + (pt.y - v.y) * (w.y - v.y)) / l2;
  t = constrain(t, 0, 1);
  
  const proj = { 
    x: v.x + t * (w.x - v.x), 
    y: v.y + t * (w.y - v.y) 
  };
  
  return dist(pt.x, pt.y, proj.x, proj.y);
}

function handlePlayer() {
  // Move player based on key presses
  if (keyIsDown(87)) player.y -= player.speed; // W
  if (keyIsDown(83)) player.y += player.speed; // S
  if (keyIsDown(65)) player.x -= player.speed; // A
  if (keyIsDown(68)) player.x += player.speed; // D
  
  // Keep player within bounds
  player.x = constrain(player.x, player.size/2, width - player.size/2);
  player.y = constrain(player.y, player.size/2, height - player.size/2);
}

function drawPlayer() {
  noStroke();
  fill(0, 191, 255);
  rectMode(CENTER);
  rect(player.x, player.y, player.size, player.size);
}

function collides(x1, y1, r1, x2, y2, r2) {
  return dist(x1, y1, x2, y2) < r1 + r2;
}

function flash(obj) {
  obj.flash = true;
  setTimeout(() => { obj.flash = false; }, 100);
}

function triangleCircleCollision(triangle, size, circle) {
  // Simple distance check for collision
  return dist(triangle.x, triangle.y, circle.x, circle.y) < (size + circle.r);
}

function teleportObject(obj) {
  // Teleport to opposite side of screen
  obj.x = width - obj.x;
  obj.y = height - obj.y;
  
  // If object has velocity, randomly reverse components
  if (obj.vx !== undefined && obj.vy !== undefined) {
    if (random() > 0.5) obj.vx *= -1;
    if (random() > 0.5) obj.vy *= -1;
  }
}

function gameOver() {
  // Update high score
  if (playerScore > highScore) highScore = playerScore;
  
  // Stop game music
  musicController.stopGame();
  
  gameState = 'gameover';
  
  noLoop();
}

function drawStartScreen() {
  noStroke();
  
  // Game title
  textAlign(CENTER, CENTER);
  textSize(72);
  fill(0, 191, 255);
  text8Bit("DODGE", width/2, height/3);
  
  // Start button
  rectMode(CENTER);
  fill(255, 0, 0);
  rect(startButton.x + startButton.width/2, startButton.y + startButton.height/2, 
       startButton.width, startButton.height, 5);
  
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(startButton.label, startButton.x + startButton.width/2, 
       startButton.y + startButton.height/2);
  
  // Instructions
  fill(255);
  textSize(18);
  text("Use WASD to move, go for the high score!", width/2, 
       startButton.y + startButton.height + 40);
  
  // Credits
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text("Made by Mason Shimek", 20, height - 20);
  
  textAlign(RIGHT, BOTTOM);
  text("Music by demon gummies, Machine Girl, Alex Peipman, and KuroSe", 
       width - 20, height - 20);
  
  rectMode(CORNER);
}

function drawGameOverScreen() {
  noStroke();
  
  // Game Over text
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(48);
  text('Game Over', width/2, height/2 - 40);
  
  // Display scores
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Final Score: " + playerScore, width/2, height/2 + 20);
  text("High Score: " + highScore, width/2, height/2 + 60);
  
  // Again button
  rectMode(CENTER);
  fill(255, 0, 0);
  rect(againButton.x + againButton.width/2, againButton.y + againButton.height/2 + 50, 
       againButton.width, againButton.height, 5);
  
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(againButton.label, againButton.x + againButton.width/2, 
       againButton.y + againButton.height/2 + 50);
  
  rectMode(CORNER);
}

function text8Bit(txt, x, y) {
  push();
  
  // Create pixelated look
  strokeWeight(6);
  stroke(0, 100, 200);
  text(txt, x, y);
  
  strokeWeight(3);
  stroke(0, 150, 255);
  text(txt, x, y);
  
  noStroke();
  fill(50, 200, 255);
  text(txt, x, y);
  
  pop();
}

function mousePressed() {
  // Start button
  if (gameState === 'start' && 
      mouseX > startButton.x && mouseX < startButton.x + startButton.width &&
      mouseY > startButton.y && mouseY < startButton.y + startButton.height) {
    startGame();
  }
  
  // Again button
  if (gameState === 'gameover' && 
      mouseX > againButton.x && mouseX < againButton.x + againButton.width &&
      mouseY > againButton.y + 50 && mouseY < againButton.y + 50 + againButton.height) {
    resetGame();
    startGame();
  }
}