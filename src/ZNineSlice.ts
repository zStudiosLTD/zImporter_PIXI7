import * as PIXI from "pixi.js";
import { NineSliceData, OrientationData } from "./SceneData";

export class ZNineSlice extends PIXI.NineSlicePlane {
    portrait: OrientationData;
    landscape: OrientationData;
    currentTransform: OrientationData;

    constructor(texture: PIXI.Texture, nineSliceData: NineSliceData, orientation: string) {
        // PIXI's order is left, top, right, bottom
        super(texture, nineSliceData.left, nineSliceData.top, nineSliceData.right, nineSliceData.bottom);
        this.portrait = nineSliceData.portrait;
        this.landscape = nineSliceData.landscape;
        this.currentTransform = orientation === "portrait" ? this.portrait : this.landscape;
        this.applyTransform();
    }

    /**
     * Switches the active orientation data and re-applies the nine-slice dimensions.
     * @param width - The new viewport width (passed by the scene; not used directly).
     * @param height - The new viewport height (passed by the scene; not used directly).
     * @param orientation - `"portrait"` or `"landscape"`.
     */
    public resize(width: number, height: number, orientation: "portrait" | "landscape") {
        this.currentTransform = orientation === "portrait" ? this.portrait : this.landscape;
        this.applyTransform();
    }

    /**
     * Reads `currentTransform.width` and `currentTransform.height` and applies
     * them to the nine-slice plane.
     */
    private applyTransform() {
        this.width = this.currentTransform.width;
        this.height = this.currentTransform.height;
    }
}