---
name: zimporter-setup
description: Set up zimporter-pixi, load a zStudio scene and find elements by name (Pixi.js 7). Load before writing any code that uses a zStudio scene.
---
# zImporter setup (Pixi.js 7)

zImporter loads scenes exported from zStudio. Install with `npm i zimporter-pixi`. The exported folder holds `placements.json` and images; serve it from somewhere like `public/assets/mainMenu/`.

```ts
import * as PIXI from 'pixi.js';
import { ZScene, ZSceneStack, ZUpdatables } from 'zimporter-pixi';

const app = new PIXI.Application({ width: innerWidth, height: innerHeight, resolution: devicePixelRatio || 1, autoDensity: true });
document.body.appendChild(app.view as HTMLCanvasElement);

ZUpdatables.init(24);                            // timeline frame rate
app.ticker.add(() => ZUpdatables.update());      // required, or timelines stay frozen

window.addEventListener('resize', () => {
  app.renderer.resize(innerWidth, innerHeight);
  ZSceneStack.resize(innerWidth, innerHeight);
});

const scene = new ZScene('mainMenu');
scene.load('./assets/mainMenu/', () => {         // keep the trailing slash
  ZSceneStack.push(scene);
  scene.loadStage(app.stage);
  // wire up the scene here
}, (progress) => { /* 0 to 1 */ });
```

A failed load of `placements.json` can stay silent. If nothing appears, check the Network tab and the trailing slash.

## Finding elements

Always call these after `loadStage()`.

```ts
const stage = scene.sceneStage;
const btn = stage.get('playBtn') as ZButton;     // searches all levels, first match or null
const close = popup.get('closeBtn') as ZButton;  // search inside one container
stage.getAll('coin');                     // all elements with this name
stage.getAllOfType('ZButton');                   // all elements of a type
stage.playBtn;                                   // direct children are also properties
```

Names are the instance names set in zStudio. The class comes from the container type: Button = `ZButton`, Toggle = `ZToggle`, Slider = `ZSlider`, Scroll Bar = `ZScroll`, State = `ZState`. Check timelines with `instanceof ZTimeline`.

## Switching scenes

```ts
ZSceneStack.pop();          // or clear() to remove every scene
await oldScene.destroy();
const next = new ZScene('mainMenu');
next.load(path, () => { ZSceneStack.push(next); next.loadStage(app.stage); });
```

 To layer a scene over another, push and load it without destroying the first. Also available: `ZSceneStack.peek()`, `getStackSize()`, `ZScene.getSceneById(id)`.
