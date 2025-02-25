# 🎮 Game Architecture Documentation

## Overview

Our game uses a hybrid Entity-Component-System (ECS) architecture, combining traditional OOP with system-based management for better separation of concerns and modularity.

## 🏗 Core Architecture

### Base Scene (`BaseScene`)

- Extends Phaser's Scene
- Manages system lifecycle (init, update, destroy)
- Maintains a map of active systems
- Provides system registration and removal

### Systems

Each system handles a specific aspect of the game logic:

#### 🎮 InputSystem

- Manages all input handling
- Maintains input configuration
- Tracks input handlers
- Provides centralized input state

#### 🔄 PhysicsSystem

- Handles physics interactions
- Manages collision groups
- Controls physics bodies
- Handles collision detection

#### 🎨 AnimationSystem

- Controls sprite animations
- Manages animation states
- Handles animation transitions
- Creates and updates animations

#### 🐛 DebugSystem

- Provides debugging tools
- Shows physics debug info
- Displays performance metrics
- Toggleable debug overlay

## 🎯 Interfaces

### IScene

```typescript
interface IScene extends Scene {
  systems: Map<string, ISystem>;
  addSystem(key: string, system: ISystem): void;
  removeSystem(key: string): void;
}
```

### ISystem

```typescript
interface ISystem {
  init(): void;
  update(): void;
  destroy(): void;
}
```

### IGameEntity

```typescript
interface IGameEntity {
  update(): void;
  destroy(): void;
}
```

### IPhysicsEntity

```typescript
interface IPhysicsEntity extends IGameEntity {
  getBody(): Physics.Arcade.Body | Physics.Arcade.StaticBody;
}
```

### IAnimatedEntity

```typescript
interface IAnimatedEntity extends IGameEntity {
  playAnimation(key: string, ignoreIfPlaying?: boolean): void;
}
```

### IInputHandler

```typescript
interface IInputHandler {
  handleInput(): void;
}
```

## 🎮 Game Objects

### Player

- Extends `Phaser.Physics.Arcade.Sprite`
- Implements `IInputHandler` interface
- Handles player movement, jumping, and animations
- **Weapon System**: Player now has a gun that can shoot projectiles
- Properties:
  - `cursors`: Input keys for movement
  - `isJumping`: Tracks jump state
  - `canDoubleJump`: Allows for double jump mechanic
  - `gun`: Reference to the gun sprite
  - `bullets`: Physics group for bullet management
  - `facing`: Tracks which direction the player is facing
  - `lastFired`: Timestamp of last shot for rate limiting
  - `fireRate`: Milliseconds between shots

### Platform

- Static physics object
- Provides collision surfaces
- Managed by PhysicsSystem

### Background

- Handles parallax scrolling
- Multiple depth layers
- Visual only, no physics

### DestructibleObject

- Extends `Phaser.Physics.Arcade.Sprite`
- Represents objects in the game world that can be destroyed by bullets
- Properties:
  - `health`: Number of hits required to destroy the object
  - `isDestroyed`: Flag to prevent multiple destruction events
- Methods:
  - `hit()`: Handles being hit by a bullet, reduces health
  - `destroy()`: Handles destruction with explosion effects

## Weapon System

The game now includes a weapon system with the following components:

### Gun

- Attached to the player character
- Follows player movement and rotation
- Visual representation using the `gun.png` sprite

### Bullets

- Created when the player presses the fire button (spacebar)
- Managed through a Phaser physics group
- Travel in the direction the player is facing
- Collide with destructible objects

### Visual Effects

- **Muzzle Flash**: Appears when firing the gun
- **Impact Effects**: Appear when bullets hit objects
- **Explosions**: Play when destructible objects are destroyed

### Sound Effects

- **Shoot Sound**: Plays when firing the gun
- **Hit Sound**: Plays when bullets hit objects
- **Explosion Sound**: Plays when objects are destroyed

## 🔄 Data Flow

1. Scene Creation:

   ```
   BaseScene
   ├── System Registration
   │   ├── InputSystem
   │   ├── PhysicsSystem
   │   ├── AnimationSystem
   │   └── DebugSystem
   └── Entity Creation
       ├── Player
       ├── Platforms
       └── Background
   ```

2. Update Cycle:
   ```
   BaseScene.update()
   ├── InputSystem.update()
   │   └── Entity.handleInput()
   ├── PhysicsSystem.update()
   │   └── Entity.update()
   ├── AnimationSystem.update()
   │   └── Entity.playAnimation()
   └── DebugSystem.update()
       └── Debug Visualization
   ```

## 🎯 Best Practices

1. **System Registration**

   - Register systems in scene's create method
   - Use consistent system keys
   - Initialize systems in order of dependency

2. **Entity Creation**

   - Register entities with relevant systems
   - Implement required interfaces
   - Clean up in destroy method

3. **Input Handling**

   - Use InputSystem for all input
   - Implement IInputHandler
   - Keep input logic separate from physics

4. **Physics Management**
   - Use PhysicsSystem for collisions
   - Implement IPhysicsEntity
   - Set up collision groups properly

## 🔄 Adding New Features

1. **New System**

   ```typescript
   class NewSystem implements ISystem {
     init(): void {}
     update(): void {}
     destroy(): void {}
   }
   ```

2. **New Entity**

   ```typescript
   class NewEntity implements IGameEntity {
     update(): void {}
     destroy(): void {}
   }
   ```

3. **System Registration**
   ```typescript
   const newSystem = new NewSystem(this);
   this.addSystem("newSystem", newSystem);
   ```

## 🐛 Debugging

- Use DebugSystem for visualization
- Toggle debug features with backtick key
- Available debug options:
  - Physics visualization
  - Velocity vectors
  - FPS counter
  - Collision boxes

## Collision Handling

- Bullet-Destructible collision: When bullets hit destructible objects, the `handleBulletCollision` method is called
- This method:
  1. Disables the bullet
  2. Creates an impact effect
  3. Calls the `hit()` method on the destructible object

## Asset Generation

The game uses procedurally generated assets:

- **Player Sprite**: Sci-fi astronaut with animations
- **Gun Sprite**: Energy weapon with glowing core
- **Bullet Sprite**: Energy projectile with gradient effect
- **Muzzle Flash**: Multi-frame animation for firing effect
- **Destructible Objects**: Tech containers with warning stripes
- **Explosion**: Multi-frame animation with particle effects
- **Sound Effects**: Placeholder MP3 files for shooting, impacts, and explosions
