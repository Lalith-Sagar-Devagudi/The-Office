window.onload = function() {
  const config = {
    type: Phaser.AUTO,
    width: 768,
    height: 768,
    parent: 'game-container',
    scene: { preload, create },
    physics: { default: 'arcade' }
  };
  const game = new Phaser.Game(config);

  function preload() {
    // 1) Load the exported JSON map
    this.load.tilemapTiledJSON('officeMap', 'assets/officemap.json');

    // 2) Load the tileset images
    this.load.image('OfficeTiles', 'assets/TileMap office.png');
    this.load.image('officeequip', 'assets/Office 32.png');

    // 3) Load the 32×32 character sheet
    this.load.spritesheet('staff', 'assets/Office 32 Character.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  function create() {
    // --- Build the map layers ---
    const map = this.make.tilemap({ key: 'officeMap' });
    const tsOffice = map.addTilesetImage('OfficeTiles', 'OfficeTiles');
    const tsEquip = map.addTilesetImage('officeequip', 'officeequip');
    map.createLayer('Tile Layer 1', [ tsOffice, tsEquip ], 0, 0);

    // --- Define sprite rows for each role ---
    const charRows = {
      'CEO': 0,
      'Dev': 2,
      'HR': 4
    };

    // --- Create walk animations per role & direction ---
    Object.entries(charRows).forEach(([role, row]) => {
      const base = row * 10;
      this.anims.create({
        key: `walk-down-${role}`,
        frames: this.anims.generateFrameNumbers('staff', { start: base + 0, end: base + 3 }),
        frameRate: 8,
        repeat: -1
      });
      this.anims.create({
        key: `walk-left-${role}`,
        frames: this.anims.generateFrameNumbers('staff', { start: base + 4, end: base + 7 }),
        frameRate: 8,
        repeat: -1
      });
      this.anims.create({
        key: `walk-right-${role}`,
        frames: this.anims.generateFrameNumbers('staff', { start: base + 8, end: base + 9 }),
        frameRate: 8,
        repeat: -1
      });
      this.anims.create({
        key: `walk-up-${role}`,
        frames: this.anims.generateFrameNumbers('staff', { start: base + 8, end: base + 9 }),
        frameRate: 8,
        repeat: -1
      });
    });

    // --- Spawn interactive agents and start roaming ---
    const spawnObjs = map.getObjectLayer('Spawns').objects;
    const agents = [];

    spawnObjs.forEach(obj => {
      const role = obj.name.trim();
      const startFrame = charRows[role] * 10;

      const agent = this.physics.add.sprite(obj.x, obj.y, 'staff', startFrame)
        .setOrigin(0);
      agent.name = role;
      agent.spawnX = obj.x;
      agent.spawnY = obj.y;
      agent.task = null;
      agent.setInteractive();
      agent.play(`walk-down-${role}`);
      agent.on('pointerdown', () => this.events.emit('agentClicked', agent));

      // begin roaming and store the event for later cancellation
      agent.roamEvent = this.time.addEvent({
        delay: Phaser.Math.Between(2000, 5000),
        loop: true,
        callback: () => roamBehavior.call(this, agent)
      });

      agents.push(agent);
    });

    // --- Notify Angular that agents are ready ---
    this.events.emit('agentsSpawned', agents);

    // --- Bridge Phaser → AngularJS ---
    this.events.on('agentClicked', agent => {
      angular.element(document.body)
        .injector()
        .get('$rootScope')
        .$broadcast('agentClicked', agent);
    });

    // --- Bridge AngularJS → Phaser ---
    const bus = this.events;
    angular.element(document.body)
      .injector()
      .get('GameService')
      .setBus(bus);

    // react to task assignments
    bus.on('taskAssigned', ({ agent, task }) => {
      agent.setTint(0xffaa00);
      agent.task = task;
    });

    // react to role selections from sidebar
    bus.on('roleSelected', ({ role }) => {
      const agent = agents.find(a => a.name === role);
      if (!agent) return;
      // stop roaming
      agent.roamEvent.remove(false);
      // snap back to home
      agent.setPosition(agent.spawnX, agent.spawnY);
      // show speech bubble
      const msg = `Hallo! Thank you! You selected me the ${role}`;
      const bubble = this.add.text(agent.x + 16, agent.y - 12, msg, {
        font: '12px "Press Start 2P"',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5, 1);
      this.time.delayedCall(3000, () => bubble.destroy());
    });
  }

  // --- Helper for roaming behavior ---
  function roamBehavior(agent) {
    const speed = 60;
    const roamRadius = 96;
    const tx = Phaser.Math.Between(agent.spawnX - roamRadius, agent.spawnX + roamRadius);
    const ty = Phaser.Math.Between(agent.spawnY - roamRadius, agent.spawnY + roamRadius);
    const dx = tx - agent.x;
    const dy = ty - agent.y;
    const dist = Math.hypot(dx, dy);

    let dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }

    agent.play(`walk-${dir}-${agent.name}`);
    this.tweens.add({
      targets: agent,
      x: tx,
      y: ty,
      duration: (dist / speed) * 1000,
      onComplete: () => agent.play(`walk-down-${agent.name}`)
    });
  }
};
