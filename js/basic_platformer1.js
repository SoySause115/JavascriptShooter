var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var timer;
var interval;
var player;

	canvas.addEventListener("mousemove", track);	
	canvas.addEventListener("click", startGame);

	var arrow1 = document.getElementById("arrow");
	var arrow2 = document.getElementById("arrow");
	var arrow3 = document.getElementById("arrow");
	var arrow4 = document.getElementById("arrow");

	var mouse = {x:0, y:0};

	var bgMusic = new Audio("sounds/backgroundMusic.mp3");
	bgMusic.volume = .05;
	var gunShot = new Audio("sounds/laserGunSound2.mp3");
	gunShot.volume = .1;
	var deathSound = new Audio("sounds/deathSound2.mp3");
	var playerDeath = new Audio("sounds/death.mp3");
	playerDeath.volume = .3;

	var currentState = "start";
	var states = [];

	var playerHealth = 100;
	var enemyHealth = 100;
	
	//variables for the enemies
	var enemy = [];
	var enemyAmount = 2;//Math.round((Math.random() * 8) + 2);
	var prevEnemyAmount = enemyAmount;
	var enemyHealthBar = [];
	var enemyDamage = 15;

	var enemyDead = 0;
	var enemiesLeft = enemyAmount;

	var score = 0;

	//creates the player
	player = new GameObject({x:canvas.width/2, y:canvas.height/2, force:1, color: "blue", width: 50, height: 50});

	function enemySpawn()
	{
		for(var e = 0; e < enemyAmount; e++)
		{
			var pickSide = Math.ceil(Math.random() * 4);

			//creates enemies randomly spawning
			enemy[e] = new GameObject({color: "red", width: 50, height: 50, health:100});
			enemy[e].force = (Math.random() * 2) + .5;
			
			//selects which side the enemy spawns on
			switch(pickSide)
			{
				//top
				case 1:
				enemy[e].x = -(Math.random() * 200);
				enemy[e].y = Math.random() * 800;
				break;

				//right
				case 2:
				enemy[e].x = Math.random() * 800;
				enemy[e].y = -(Math.random() * 200);
				break;

				//bottom
				case 3:
				enemy[e].x = canvas.width + Math.random() * 200;
				enemy[e].y = Math.random() * 800;
				break;

				//left
				case 4:
				enemy[e].x = Math.random() * 800;
				enemy[e].y = canvas.height + Math.random() * 200;
				break;
			}

			//creates a healthbar for every enemy
			enemyHealthBar[e] = new GameObject();
			enemyHealthBar[e].x = enemy[e].x;
			enemyHealthBar[e].y = enemy[e].y - enemy[e].height;
			enemyHealthBar[e].width = (enemy[e].health/100)*enemy[e].width;
			enemyHealthBar[e].height = 10;
			enemyHealthBar[e].color = "green";
		}
	}

	enemySpawn();

	//creates the player healthbar
	playerHealthBar = new GameObject();
	playerHealthBar.x = canvas.width - 235;
	playerHealthBar.y = 115;
	playerHealthBar.width = playerHealth * 1.75;
	playerHealthBar.height = 30;
	playerHealthBar.color = "green";
	
	//creates the walls of the playing field
	//horizontal walls
	var wall1 = new GameObject({width: 300, height: 50, color: "#2F4F4F"});
	wall1.x = 0 + wall1.width/2;
	wall1.y = 0 + wall1.height/2

	var wall2 = new GameObject({width: 300, height: 50, color: "#2F4F4F"});
	wall2.x = canvas.width - wall2.width/2;
	wall2.y = 0 + wall2.height/2;

	var wall3 = new GameObject({width: 300, height: 50, color: "#2F4F4F"});
	wall3.x = 0 + wall3.width/2;
	wall3.y = canvas.height - wall3.height/2;

	var wall4 = new GameObject({width: 300, height: 50, color: "#2F4F4F"});
	wall4.x = canvas.width - wall4.width/2;
	wall4.y = canvas.height - wall4.height/2;

	//verticle walls
	var wall5 = new GameObject({width: 50, height: 300, color: "#2F4F4F"});
	wall5.x = 0 + wall5.width/2;
	wall5.y = 0 + wall5.height/2

	var wall6 = new GameObject({width: 50, height: 300, color: "#2F4F4F"});
	wall6.x = canvas.width - wall6.width/2;
	wall6.y = 0 + wall6.height/2;

	var wall7 = new GameObject({width: 50, height: 300, color: "#2F4F4F"});
	wall7.x = 0 + wall7.width/2;
	wall7.y = canvas.height - wall7.height/2;

	var wall8 = new GameObject({width: 50, height: 300, color: "#2F4F4F"});
	wall8.x = canvas.width - wall8.width/2;
	wall8.y = canvas.height - wall8.height/2;

	//horizontal gate walls
	var gate1 = new GameObject({width: 200, height: 30, color: "#d3d3d3"});
	gate1.x = canvas.width/2;
	gate1.y = 0 + gate1.height/2 + 10;

	var gate2 = new GameObject({width: 200, height: 30, color: "#d3d3d3"});
	gate2.x = canvas.width/2;
	gate2.y = canvas.height - gate2.height/2 - 10;

	//verticle gate walls
	var gate3 = new GameObject({width: 30, height: 200, color: "#d3d3d3"});
	gate3.x = 0 + gate3.width/2 + 10;
	gate3.y = canvas.height/2;

	var gate4 = new GameObject({width: 30, height: 200, color: "#d3d3d3"});
	gate4.x = canvas.width - gate4.width/2 - 10;
	gate4.y = canvas.height/2;

	//bounding box
	var newWaveBox = new GameObject({width: 635, height: 635, /*color: "#d3d3d3"*/});
	newWaveBox.x = canvas.width/2;
	newWaveBox.y = canvas.height/2 + 10000;

	//other box
	var bigBox = new GameObject({width: canvas.width, height: canvas.height})
	bigBox.x = canvas.width/2;
	bigBox.y = canvas.height/2 + 10000;

	//chooses how fast you can shoot bullets
	var fireCounter = 30;
	var fireRate = 20;

	//variables for the bullet spawns
	var bullet = [];
	var bulletAmount = 25;
	var currentBullet = 0;
	var range = canvas.width/2;
	var dir = {x:1,y:0};
	var bulletDamage = Math.ceil((Math.random() *10) + 15);

	//creates bullets
	for(var b = 0; b < bulletAmount; b++)
	{
		bullet[b] = new GameObject({force:10, width:20, height:20});
		bullet[b].x = player.x;
		bullet[b].y = -1000;
	}	

	var playButton = new GameObject({width: 215, height: 60, color: "#00468b"});
	var instructionButton = new GameObject({width: 215, height: 60, color: "#00468b"});
	var mainMenu = new GameObject({width: 215, height: 60, color: "#00468b"});
	var refresh = new GameObject({width: 215, height: 60, color: "#00468b"});
	refresh.x = 10000;
	var assaultButton = new GameObject({width: 215, height: 60, color: "#00468b"});
	assaultButton.x = 10000;
	var sniperButton = new GameObject({width: 215, height: 60, color: "#00468b"});
	sniperButton.x = 10000;
	var shotgunButton = new GameObject({width: 215, height: 60, color: "#00468b"});
	shotgunButton.x = 10000;
	var pistolButton = new GameObject({width: 215, height: 60, color: "#00468b"});
	pistolButton.x = 10000;

	//friction
	var fX = .85;
	var fY = .85;

	var gravity = 1;

	interval = 1000/60;
	timer = setInterval(animate, interval);

	var counterStart = 60*2;
	var counter = counterStart;

	var t;

function startGame()
{
	//picking a gun menu
	if((playButton.x - playButton.width/2) < mouse.x &&  mouse.x < (playButton.x + playButton.width/2) && (playButton.y - playButton.height/2) < mouse.y && mouse.y < (playButton.y + playButton.height/2))
	{
		changeStates("pickWeapon");
	}

	//picks assult weapon
	if((assaultButton.x - assaultButton.width/2) < mouse.x &&  mouse.x < (assaultButton.x + assaultButton.width/2) && (assaultButton.y - assaultButton.height/2) < mouse.y && mouse.y < (assaultButton.y + assaultButton.height/2))
	{
		fireRate = 12;
		bulletDamage = 10.5;
		changeStates("play");
	}

	//picks sniper weapon
	if((sniperButton.x - sniperButton.width/2) < mouse.x &&  mouse.x < (sniperButton.x + sniperButton.width/2) && (sniperButton.y - sniperButton.height/2) < mouse.y && mouse.y < (sniperButton.y + sniperButton.height/2))
	{
		fireRate = 70;
		bulletDamage = 40;
		for(var b = 0; b < bulletAmount; b++)
		{
			bullet[b].width = 9;
			bullet[b].height = 9;
		}	
		changeStates("play");
	}

	//picks shotgun weapon
	if((shotgunButton.x - shotgunButton.width/2) < mouse.x &&  mouse.x < (shotgunButton.x + shotgunButton.width/2) && (shotgunButton.y - shotgunButton.height/2) < mouse.y && mouse.y < (shotgunButton.y + shotgunButton.height/2))
	{
		fireRate = 50;
		bulletDamage = 5;
		changeStates("play");
	}
	
	//picks pistol weapon
	if((pistolButton.x - pistolButton.width/2) < mouse.x &&  mouse.x < (pistolButton.x + pistolButton.width/2) && (pistolButton.y - pistolButton.height/2) < mouse.y && mouse.y < (pistolButton.y + pistolButton.height/2))
	{
		fireRate = 30;
		bulletDamage = 21;
		changeStates("play");
	}

	//instructions button
	if((instructionButton.x - instructionButton.width/2) < mouse.x &&  mouse.x < (instructionButton.x + instructionButton.width/2) && (instructionButton.y - instructionButton.height/2) < mouse.y && mouse.y < (instructionButton.y + instructionButton.height/2))
	{
		changeStates("instruction");
	}

	//back to the main menu button
	if((mainMenu.x - mainMenu.width/2) < mouse.x &&  mouse.x < (mainMenu.x + mainMenu.width/2) && (mainMenu.y - mainMenu.height/2) < mouse.y && mouse.y < (mainMenu.y + mainMenu.height/2))
	{
		changeStates("start");
	}

	//refreshes the page
	if((refresh.x - refresh.width/2) < mouse.x &&  mouse.x < (refresh.x + refresh.width/2) && (refresh.y - refresh.height/2) < mouse.y && mouse.y < (refresh.y + refresh.height/2))
	{
		location.reload();
	}
}

function changeStates(stateName)
{
	currentState = stateName;
}

function playerChanger(){
	player.color = "blue";
}

//tracks the mouse position
function track(e)
{
	var rect = canvas.getBoundingClientRect();
	mouse.x = e.clientX - rect.left;
	mouse.y = e.clientY - rect.top;
}

function follow()
{
	for(var e = 0; e < enemyAmount; e++)
	{	
		var dx = player.x - enemy[e].x;
		var dy = player.y - enemy[e].y;
	
		var Edist = Math.sqrt(dx * dx + dy * dy);
	
		var radians = Math.atan2(dy, dx);
	
		enemy[e].vx = Math.cos(radians)*enemy[e].force;
		enemy[e].vy = Math.sin(radians)*enemy[e].force;
	
		if(Edist <= 2)
		{
			enemy[e].vx = 0;
			enemy[e].vy = 0;
		}

		enemy[e].x += enemy[e].vx * 2;
		enemy[e].y += enemy[e].vy * 2;
	}
}

function healthBarChanger()
{
	if(playerHealth > 60)
	{
		playerHealthBar.color = "green";
	}
	if(playerHealth <= 60)
	{
		playerHealthBar.color = "orange";
	}
	if(playerHealth <= 25)
	{
		playerHealthBar.color = "red";
	}
}

var firing = false;

function fire()
{
	firing = true;
}

function stopFire()
{
	firing = false;
	fireCounter = 0;
}

function drawImageRot(img,x,y,width,height,deg){

    //Convert degrees to radian 
    var rad = deg * Math.PI / 180;

    //Set the origin to the center of the image
    context.translate(x + width / 2, y + height / 2);

    //Rotate the canvas around the origin
    context.rotate(rad);

    //draw the image    
    context.drawImage(img,width / 2 * (-1),height / 2 * (-1),width,height);

    //reset the canvas  
    context.rotate(rad * ( -1 ) );
    context.translate((x + width / 2) * (-1), (y + height / 2) * (-1));
}

states["start"] = function()
{	
	context.font = "70px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("The Guardian", 210, canvas.width/2 - 50)

	mainMenu.x = 100000;

	playButton.x = canvas.width/2 - 110;
	playButton.y = canvas.height - 350;

	instructionButton.x = canvas.width/2 + 130;
	instructionButton.y = canvas.height - 350;

	//horizontal walls
	wall1.drawRect();
	wall2.drawRect();
	wall3.drawRect();
	wall4.drawRect();
	
	//verticle walls
	wall5.drawRect();
	wall6.drawRect();
	wall7.drawRect();
	wall8.drawRect();

	//bounding box
	//newWaveBox.drawRect();

	//horizontal gates
	gate1.drawRect();
	gate2.drawRect();

	//verticle gates
	gate3.drawRect();
	gate4.drawRect();

	playButton.drawRect();
	instructionButton.drawRect();

	context.font = "45px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Start", canvas.width/2 - 160, canvas.height - 335)

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Instructions", canvas.width/2 + 35, canvas.height - 335)

}

states["instruction"] = function()
{
	context.font = "55px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Instructions", 255, 200);

	context.font = "30px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Your mission is to get as", 245, 255);
	context.fillText("many points as you can without dying.", 155, 290);
	context.fillText("W - walk upwards", 285, 350);
	context.fillText("A - walk left", 285, 390);
	context.fillText("S - walk downwards", 285, 430);
	context.fillText("D - walk downwards", 285, 470);
	context.fillText("Click to shoot!", 305, 530);

	playButton.x = 100000;
	instructionButton.x = 10000;

	mainMenu.x = canvas.width/2;
	mainMenu.y = canvas.height - 200;

	//horizontal walls
	wall1.drawRect();
	wall2.drawRect();
	wall3.drawRect();
	wall4.drawRect();
	
	//verticle walls
	wall5.drawRect();
	wall6.drawRect();
	wall7.drawRect();
	wall8.drawRect();

	//bounding box
	//newWaveBox.drawRect();

	//horizontal gates
	gate1.drawRect();
	gate2.drawRect();

	//verticle gates
	gate3.drawRect();
	gate4.drawRect();

	mainMenu.drawRect();

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Back to main", canvas.width/2 - 101, canvas.height - 190)
}

states["pickWeapon"] = function()
{
	context.font = "55px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Pick a gun", 270, 250);

	playButton.x = 100000;
	instructionButton.x = 10000;
	mainMenu.x = 10000;

	assaultButton.x = canvas.width/2;
	assaultButton.y = 325;

	sniperButton.x = canvas.width/2;
	sniperButton.y = 400;

	shotgunButton.x = canvas.width/2;
	shotgunButton.y = 475;

	pistolButton.x = canvas.width/2;
	pistolButton.y = 550;

	//horizontal walls
	wall1.drawRect();
	wall2.drawRect();
	wall3.drawRect();
	wall4.drawRect();
	
	//verticle walls
	wall5.drawRect();
	wall6.drawRect();
	wall7.drawRect();
	wall8.drawRect();

	//bounding box
	//newWaveBox.drawRect();

	//horizontal gates
	gate1.drawRect();
	gate2.drawRect();

	//verticle gates
	gate3.drawRect();
	gate4.drawRect();

	assaultButton.drawRect();	

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Assault Rifle", canvas.width/2 - 97, 340)

	sniperButton.drawRect();

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Sniper Rifle", canvas.width/2 - 91, 415)

	shotgunButton.drawRect();

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Shotgun", canvas.width/2 - 63, 490)

	pistolButton.drawRect();

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Pistol", canvas.width/2 - 43, 565)
}

states["play"] = function()
{
	canvas.addEventListener("mousedown", fire);
	canvas.addEventListener("mouseup", stopFire);

	//counter for health
	counter--;

	bgMusic.play();

	context.clearRect(0,0,canvas.width, canvas.height);	

	follow();

	playButton.x = 10000;
	instructionButton.x = 10000; 
	mainMenu.x = 10000;
	assaultButton.x = 10000;
	sniperButton.x = 10000;
	shotgunButton.x = 10000;
	pistolButton.x = 10000;

	if(w)
	{
		player.vy += player.ay * -player.force;
		if(!a && !d){dir.x = 0;}
		dir.y = -1;
	}
	if(a)
	{
		player.vx += player.ax * -player.force;
		dir.x = -1;
		if(!w && !s){dir.y = 0;}
	}
	if(s)
	{
		player.vy += player.ay * player.force;
		if(!a && !d){dir.x = 0;}
		dir.y = 1;
	}
	if(d)
	{
		player.vx += player.ax * player.force;
		dir.x = 1;
		if(!w && !s){dir.y = 0;}
	}

	fireCounter--;

	if(fireCounter <= 0 && firing)
	{
		//figures out how far away the bullet is from the player
		var Bdx = mouse.x - player.x;
		var Bdy = mouse.y - player.y;

		var radians = Math.atan2(Bdy,Bdx);

		if(fireRate == 50)
		{
			for(var b = 0; b <= 10; b++)
			{
				Bdx = (mouse.x + rand(-120, 120)) - player.x;
				Bdy = (mouse.y + rand(-120, 120)) - player.y;

				radians = Math.atan2(Bdy,Bdx);

				//spawns the bullet on the player before moving
				bullet[b].x = player.x;
				bullet[b].y = player.y;
	
				//puts the bullet in the direction that the mouse is
				bullet[b].vx = Math.cos(radians) * 10;
				bullet[b].vy = Math.sin(radians) * 10;
			}
		}
		else
		{
			//spawns the bullet on the player before moving
			bullet[currentBullet].x = player.x;
			bullet[currentBullet].y = player.y;
	
			//puts the bullet in the direction that the mouse is
			bullet[currentBullet].vx = Math.cos(radians) * 10;
			bullet[currentBullet].vy = Math.sin(radians) * 10;
		}

		//plays the gunshot sound
		gunShot.currentTime = 0;
		gunShot.play();

		fireCounter = fireRate;

		currentBullet++;

		if(currentBullet >= bulletAmount)
		{
			currentBullet = 0;
		}
	}
	
	//applies friction
	player.vx *= fX;
	player.vy *= fY;
	
	//hit test collision
	//top left
	while(wall1.hitTestPoint(player.top()) && player.vy <=0)
	{
		player.y++;
		player.vy = 0;
	}
	while(wall1.hitTestPoint(player.left()) && player.vx <=0)
	{
		player.x++;
		player.vx = 0;
	}

	while(wall5.hitTestPoint(player.top()) && player.vy <=0)
	{
		player.y++;
		player.vy = 0;
	}
	while(wall5.hitTestPoint(player.left()) && player.vx <=0)
	{
		player.x++;
		player.vx = 0;
	}

	//top right
	while(wall2.hitTestPoint(player.top()) && player.vy <=0)
	{
		player.y++;
		player.vy = 0;
	}
	while(wall2.hitTestPoint(player.right()) && player.vx >=0)
	{
		player.x--;
		player.vx = 0;
	}

	while(wall6.hitTestPoint(player.top()) && player.vy <=0)
	{
		player.y++;
		player.vy = 0;
	}
	while(wall6.hitTestPoint(player.right()) && player.vx >=0)
	{
		player.x--;
		player.vx = 0;
	}

	//bottom left
	while(wall3.hitTestPoint(player.bottom()) && player.vy >=0)
	{
		player.y--;
		player.vy = 0;
	}
	while(wall3.hitTestPoint(player.left()) && player.vx <=0)
	{
		player.x++;
		player.vx = 0;
	}

	while(wall7.hitTestPoint(player.bottom()) && player.vy >=0)
	{
		player.y--;
		player.vy = 0;
	}
	while(wall7.hitTestPoint(player.left()) && player.vx <=0)
	{
		player.x++;
		player.vx = 0;
	}

	//bottom right
	while(wall4.hitTestPoint(player.bottom()) && player.vy >=0)
	{
		player.y--;
		player.vy = 0;
	}
	while(wall4.hitTestPoint(player.right()) && player.vx >=0)
	{
		player.x--;
		player.vx = 0;
	}

	while(wall8.hitTestPoint(player.bottom()) && player.vy >=0)
	{
		player.y--;
		player.vy = 0;
	}
	while(wall8.hitTestPoint(player.right()) && player.vx >=0)
	{
		player.x--;
		player.vx = 0;
	}

	//gates
	//top
	while(gate1.hitTestPoint(player.top()) && player.vy <=0)
	{
		player.y++;
		player.vy = 0;
	}

	//right
	while(gate3.hitTestPoint(player.left()) && player.vx <=0)
	{
		player.x++;
		player.vx = 0;
	}

	//bottom
	while(gate4.hitTestPoint(player.right()) && player.vx >=0)
	{
		player.x--;
		player.vx = 0;
	}

	//left
	while(gate2.hitTestPoint(player.bottom()) && player.vy >=0)
	{
		player.y--;
		player.vy = 0;
	}

	//"spawns" the bullet
	for(var b = 0; b < currentBullet; b++)
	{
		var dx = bullet[b].x - player.x;
		var dy = bullet[b].y - player.y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		if(dist >= range)
		{
			bullet[b].vx = 0;
			bullet[b].y = -1000;
		}

		bullet[b].move();
		bullet[b].drawRect();
	}

	//if player hits the enemy
	for(var e = 0; e < enemyAmount; e++)
	{
		if(player.hitTestObject(enemy[e]))
		{
			if(counter < 0)
			{
				player.color = "yellow";
				counter = counterStart;
				playerHealth += -enemyDamage;
				healthBarChanger();
				if(playerHealth <= 0)
				{
					bgMusic.pause();
					playerHealth = 0;
					playerDeath.play();
					changeStates("dead");
				}
				playerHealthBar.width = playerHealth * 1.75;

				clearTimeout(t);
        	    t = setTimeout(playerChanger, 2000);
			}
		}
	}

	for(var b = 0; b < bulletAmount; b++)
	{
		for(var e = 0; e < enemyAmount; e++)
		{
			if(bullet[b].hitTestObject(enemy[e]))
			{
				bullet[b].y = 10000;
				enemy[e].health += -bulletDamage;
				if(enemy[e].health <= 0)
				{
					deathSound.currentTime = 0;
					deathSound.play();
					score += 100;
					enemy[e].health = 100;
					enemy[e].x = 1000000;
					enemyDead++;
					enemiesLeft--;
				}
				enemyHealthBar[e].width = enemy[e].health / 2;
			}
		}
	}

	if(enemyDead == enemyAmount)
	{
		gate1.y = 10000;
		gate2.y = 10000;
		gate3.y = 10000;
		gate4.y = 10000;

		var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);

		drawImageRot(arrow1, 90, canvas.height/2 - arrow1.height/2, 125, 75, 0);
		drawImageRot(arrow2, canvas.width - 210, canvas.height/2 - arrow2.height/2, 125, 75, 180);
		drawImageRot(arrow3, canvas.width/2 - arrow3.height/2 - 10, 90, 125, 75, 90);
		drawImageRot(arrow4, canvas.width/2 - arrow4.height/2 - 10, canvas.height - 210, 125, 75, 270);
	}

	if(bigBox.hitTestObject(player))
	{
		if((player.x - player.width/2) < 0)
		{
			player.x++;
			player.vx = 0;
		}
		if((player.x + player.width/2) > canvas.width)
		{
			player.x--;
			player.vx = 0;
		}
		if((player.y - player.height/2) < 0)
		{
			player.y++;
			player.vy = 0;
		}
		if((player.y + player.height/2) > canvas.height)
		{
			player.y--;
			player.vy = 0;
		}
	}
	else
	{
		//if the player touches the wall, they goes to the other side of the canvas
		//also spawns a "new wave box" to respawn enemies
		if(player.y < 0)
		{
			arrow1.y = 10000;
			arrow2.y = 10000;
			arrow3.y = 10000;
			arrow4.y = 10000;

			playerHealth += 10;
			if(playerHealth > 100)
			{
				playerHealth = 100;
			}
			playerHealthBar.width = playerHealth * 1.75;
			healthBarChanger();

			bigBox.y = canvas.height/2;

			player.y = canvas.height;
			newWaveBox.y = canvas.height/2;
			newWaveBox.x = canvas.width/2;
			
			wall1.color = randomColor;
			wall2.color = randomColor;
			wall3.color = randomColor;
			wall4.color = randomColor;
			wall5.color = randomColor;
			wall6.color = randomColor;
			wall7.color = randomColor;
			wall8.color = randomColor;
		}
		if(player.y > canvas.height)
		{
			arrow1.y = 10000;
			arrow2.y = 10000;
			arrow3.y = 10000;
			arrow4.y = 10000;

			playerHealth += 10;
			if(playerHealth > 100)
			{
				playerHealth = 100;
			}
			playerHealthBar.width = playerHealth * 1.75;
			healthBarChanger();
			
			bigBox.y = canvas.height/2;

			player.y = 0;
			newWaveBox.y = canvas.height/2;
			newWaveBox.x = canvas.width/2;
			
			wall1.color = randomColor;
			wall2.color = randomColor;
			wall3.color = randomColor;
			wall4.color = randomColor;
			wall5.color = randomColor;
			wall6.color = randomColor;
			wall7.color = randomColor;
			wall8.color = randomColor;
		}
		if(player.x < 0)
		{
			arrow1.y = 10000;
			arrow2.y = 10000;
			arrow3.y = 10000;
			arrow4.y = 10000;

			playerHealth += 10;
			if(playerHealth > 100)
			{
				playerHealth = 100;
			}
			playerHealthBar.width = playerHealth * 1.75;
			healthBarChanger();

			bigBox.y = canvas.height/2;

			player.x = canvas.width;
			newWaveBox.y = canvas.height/2;
			newWaveBox.x = canvas.width/2;
			
			wall1.color = randomColor;
			wall2.color = randomColor;
			wall3.color = randomColor;
			wall4.color = randomColor;
			wall5.color = randomColor;
			wall6.color = randomColor;
			wall7.color = randomColor;
			wall8.color = randomColor;
		}
		if(player.x > canvas.width)
		{
			arrow1.y = 10000;
			arrow2.y = 10000;
			arrow3.y = 10000;
			arrow4.y = 10000;

			playerHealth += 10;
			if(playerHealth > 100)
			{
				playerHealth = 100;
			}
			playerHealthBar.width = playerHealth * 1.75;
			healthBarChanger();

			bigBox.y = canvas.height/2;

			player.x = 0;
			newWaveBox.y = canvas.height/2;
			newWaveBox.x = canvas.width/2;
			
			wall1.color = randomColor;
			wall2.color = randomColor;
			wall3.color = randomColor;
			wall4.color = randomColor;
			wall5.color = randomColor;
			wall6.color = randomColor;
			wall7.color = randomColor;
			wall8.color = randomColor;
		}
	}

	if(newWaveBox.hitTestPoint(player))
	{
		enemyAmount = prevEnemyAmount + 1;
		prevEnemyAmount += 1;
		enemy = [];
		enemySpawn();
		newWaveBox.y = 10000;
		bigBox.y = 10000;
		enemyDead = 0;
		enemiesLeft = enemyAmount;

		//puts the gates back
		gate1.y = 0 + gate1.height/2 + 10;
		gate2.y = canvas.height - gate2.height/2 - 10;
		gate3.y = canvas.height/2;
		gate4.y = canvas.height/2;
	}
	
	player.x += Math.round(player.vx);
	player.y += Math.round(player.vy);

	//draws the shapes
	for(var e = 0; e < enemy.length; e++)
	{
		enemyHealthBar[e].width = (enemy[e].health/100)*enemy[e].width;
		enemy[e].drawRect();
		enemyHealthBar[e].x = enemy[e].x;
		enemyHealthBar[e].y = enemy[e].y - enemy[e].height;
		enemyHealthBar[e].drawRect();
	}

	//horizontal walls
	wall1.drawRect();
	wall2.drawRect();
	wall3.drawRect();
	wall4.drawRect();
	
	//verticle walls
	wall5.drawRect();
	wall6.drawRect();
	wall7.drawRect();
	wall8.drawRect();

	//bounding box
	//newWaveBox.drawRect();

	//horizontal gates
	gate1.drawRect();
	gate2.drawRect();

	//verticle gates
	gate3.drawRect();
	gate4.drawRect();

	//draws the player and player health
	player.drawRect();
	playerHealthBar.drawRect2();

	//text for player health bar
	context.font = "35px Georgia";
    context.fillStyle = "#d0d0d0";
	context.fillText("Health: " + playerHealth, canvas.width - 240, 85);

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Score: " + score, 60, 85)

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Enemies Left: " + enemiesLeft, 60, 125)
}

states["dead"] = function()
{
	context.font = "60px Georgia";
	context.fillStyle = "#d0d0d0";
 	context.fillText("You have died!", 210, canvas.height/2);

	playButton.x = 10000;
	instructionButton.x = 10000; 
	mainMenu.x = 10000;

	refresh.x = canvas.width/2;
	refresh.y = canvas.height - 325;

	//horizontal walls
	wall1.drawRect();
	wall2.drawRect();
	wall3.drawRect();
	wall4.drawRect();
	
	//verticle walls
	wall5.drawRect();
	wall6.drawRect();
	wall7.drawRect();
	wall8.drawRect();

	//bounding box
	//newWaveBox.drawRect();

	//horizontal gates
	gate1.drawRect();
	gate2.drawRect();

	//verticle gates
	gate3.drawRect();
	gate4.drawRect();

	//mainMenu.drawRect();
	refresh.drawRect();

	context.font = "35px Georgia";
    context.fillStyle = "#d0d0d0";
	context.fillText("Health: " + playerHealth, canvas.width - 240, 85);

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Score: " + score, 60, 85)

	context.font = "35px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Enemies Left: " + enemiesLeft, 60, 125)

	context.font = "45px Georgia";
	context.fillStyle = "#d0d0d0";
	context.fillText("Retry?", canvas.width/2 - 65, canvas.height - 310)

}

function animate()
{
	context.clearRect(0,0,canvas.width, canvas.height);	
	states[currentState]();
}