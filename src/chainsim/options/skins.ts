import { ASSET_PATH } from '../constants';
import * as PIXI from 'pixi.js';
import { Sprite, Container } from 'pixi.js';
import { Chainsim } from '../';
import skinList from '../skin-names.json';
import { OptionsMenu } from '.';
import { OptionPage } from './page';

/** The field frame. Contains the borders, background, and field layers.*/
export class SkinPage extends OptionPage {
  private optionsMenu: OptionsMenu;

  private skinFileNames: string[];
  private skinNames: string[];
  private skinRows: Sprite[];
  private scrollContainer: Container;
  private skinGroup: Container[];
  private bar: Sprite;
  private offset: number;
  private selectedBorder: PIXI.Graphics;
  private skinIdx: number;

  private pointerDown: boolean;

  constructor(chainsim: Chainsim, optionsMenu: OptionsMenu) {
    super(chainsim);

    this.visible = true;
    this.optionsMenu = optionsMenu;

    this.skinFileNames = Object.keys(skinList);
    const skinObjs = Object.values(skinList);
    this.skinNames = skinObjs.map((obj) => obj['en']);

    this.pointerDown = false;

    const style = new PIXI.TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 36,
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: '#555555',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 4,
    });

    this.scrollContainer = new Container();
    this.skinGroup = [];
    this.skinRows = [];
    for (let i = 0; i < this.skinFileNames.length; i++) {
      const fileName = this.skinFileNames[i];

      // Interactive container
      const group = new Container();
      group.interactive = true;
      group.buttonMode = true;

      // Name
      const name = new PIXI.Text(this.skinNames[i], style);
      name.position.set(0, 0);

      // 6 Puyos
      this.skinRows[i] = new Sprite(this.puyoExTextures[fileName]);
      this.skinRows[i].position.set(0, 48);

      group.addChild(name, this.skinRows[i]);
      group.position.set(0, (group.height + 10) * i);
      this.skinGroup[i] = group;
      this.scrollContainer.addChild(group);
      // this.scrollContainer.addChild(name, this.skinRows[i]);
    }
    this.scrollContainer.y = 10;
    this.addChild(this.scrollContainer);

    // Scroller
    const top = 50;
    const bot = 700;
    const line = new PIXI.Graphics();
    line.lineStyle(5, 0x777777);
    line.moveTo(500, top);
    line.lineTo(500, bot);
    this.addChild(line);

    // Bar
    this.bar = new Sprite(this.toolTextures['sliding_rect.png']);
    this.bar.anchor.set(0.5);
    this.bar.scale.set(0.8);
    this.bar.rotation = (-1 * Math.PI) / 2;
    this.bar.position.set(500, top);
    this.bar.on('pointerdown', (event: PIXI.InteractionEvent) => {
      const pos = event.data.getLocalPosition(this);
      this.bar.y = pos.y;
      this.pointerDown = true;
    });
    this.bar.on('pointermove', (event: PIXI.InteractionEvent) => {
      if (this.pointerDown) {
        const pos = event.data.getLocalPosition(this);
        this.bar.y = pos.y;
      }
    });
    this.bar.on('pointerup', () => (this.pointerDown = false));
    this.bar.on('pointerupoutside', () => (this.pointerDown = false));
    this.bar.interactive = true;
    this.bar.buttonMode = true;
    this.addChild(this.bar);

    // Mask
    const mask = new PIXI.Graphics();
    mask.beginFill(0x000000);
    mask.drawRect(-10, 20, 510, 800);
    mask.endFill();
    this.scrollContainer.mask = mask;
    this.addChild(mask);

    // Border that appears around the selected skin
    this.selectedBorder = new PIXI.Graphics();
    this.selectedBorder.lineStyle(3, 0xffffff);
    this.selectedBorder.beginFill(0x000000, 0);
    this.selectedBorder.drawRoundedRect(-5, 30, this.skinGroup[0].width + 5, this.skinGroup[0].height, 5);
    this.selectedBorder.endFill();
    this.selectedBorder.mask = mask;
    this.addChild(this.selectedBorder);

    // Button event for selecting a new skin
    for (let i = 0; i < this.skinGroup.length; i++) {
      const group = this.skinGroup[i];
      group.on('pointerdown', () => {
        this.selectedBorder.y = group.y;
        this.loadTexture(i);
        this.skinIdx = i;
      });
    }

    // Initializing the value of this.skinIdx
    const cleanFileNames = this.skinFileNames.map((path) => path.replace('_trim', ''));
    const loadedFile = this.resources[`${ASSET_PATH}/puyo.json`].data.meta.image.split('/').pop();
    this.skinIdx = Math.max(0, cleanFileNames.indexOf(loadedFile));

    // Set the original position for the scrollContainer to have the border in view at first.
    const targetY = this.skinGroup[this.skinIdx].toLocal(this).y;
    const targetRatio = Math.abs(targetY) / this.scrollContainer.height;
    this.bar.y = 50 + (700 - 50) * targetRatio;

    this.offset = 0;
  }

  public update(): void {
    if (this.bar.y < 50) this.bar.y = 50;
    if (this.bar.y > 700) this.bar.y = 700;

    this.offset = (this.bar.y - 50) / (700 - 50);
    this.scrollContainer.y = 30 + (this.scrollContainer.height - 700) * this.offset * -1;
    this.selectedBorder.y = -30 + this.skinGroup[this.skinIdx].toLocal(this).y * -1;
  }

  private async loadTexture(idx: number): Promise<void> {
    // Set the optionsmenu state to loading so users don't mess with any other options.
    this.optionsMenu.isLoading = true;

    const fileName = this.skinFileNames[idx].replace('_trim', '');
    const filePath = `${ASSET_PATH}/puyo/${fileName}`;

    // Get a copy of the spritesheet json
    const json = JSON.parse(JSON.stringify(this.resources[`${ASSET_PATH}/puyo.json`].data));
    json.meta.image = filePath;

    const sheetBase64 = globalThis.btoa(JSON.stringify(json));
    const sheetURL = 'data:application/json;base64,' + sheetBase64;

    // Destroy all the Puyo Textures
    const puyoTextures = this.resources[`${ASSET_PATH}/puyo.json`].textures as PIXI.ITextureDictionary;
    for (const texture in puyoTextures) {
      puyoTextures[texture].destroy(true);
    }

    // Destroy it in the texture cache too
    PIXI.utils.TextureCache['/sim_assets/img/puyo.json_image'].destroy();

    // Delete it from the resource loader
    delete this.resources['/sim_assets/img/puyo.json'];
    delete this.resources['/sim_assets/img/puyo.json_image'];

    this.chainsim.loader
      .add(`${ASSET_PATH}/puyo.json`, sheetURL)
      .load()
      .onComplete.once(() => {
        // Refresh everything that relies on puyoTextures
        this.chainsim.frame?.puyoLayer.refreshSprites(this.chainsim.frame?.puyoLayer.tempField);
        this.chainsim.frame?.shadowLayer.refreshSprites(this.chainsim.frame?.shadowLayer.tempField);
        this.chainsim.activePair?.refreshSprites();
        this.chainsim.nextWindow?.colorSet.refreshSprites();
        this.chainsim.nextWindow?.drawer.refreshSprites();
        this.chainsim.nextWindow?.window.nextPuyos.refreshSprites();
        this.chainsim.garbageTray?.refreshSprites();
        this.chainsim.toolbox?.simAndEdit.editingTools.pageMain.refreshSprites();
        this.chainsim.toolbox?.simAndEdit.editingTools.pageShadow.refreshSprites();

        this.optionsMenu.isLoading = false;
      });
  }
}
