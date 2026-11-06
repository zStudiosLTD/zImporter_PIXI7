import { ZContainer } from "./ZContainer";
import { FederatedPointerEvent, Point } from "pixi.js";

interface DragEvent extends FederatedPointerEvent {
    global: Point;
}

export class ZSlider extends ZContainer {
    // Slider specific properties and methods can be added here

    dragging = false;
    sliderWidth: number | undefined = 0;
    callback?: (t: number) => void;
    onDragStartBinded: any;
    onDragEndBinded: any;
    onDragBinded: any;

    /**
     * Initialises the slider: resolves the `handle` and `track` children,
     * measures the track width, binds drag handlers, and attaches listeners to
     * the handle.
     */
    init() {
        super.init();

        const handle: ZContainer = this.get('handle') as ZContainer;
        const track: ZContainer = this.get('track') as ZContainer;
        if (!handle || !track) {
            console.error("ZSlider is missing handle or track");
            return;
        }

        this.sliderWidth = track.width;
        this.onDragStartBinded = this.onDragStart.bind(this);
        this.onDragEndBinded = this.onDragEnd.bind(this);
        this.onDragBinded = this.onDrag.bind(this);

        handle.interactive = true; // plain containers get no pointer events otherwise

        handle
            .on('pointerdown', this.onDragStartBinded).on('touchstart', this.onDragStartBinded)
            .cursor = 'pointer';
    }

    /**
     * Returns the class type identifier.
     * @returns `"ZSlider"`
     */
    public getType(): string {
        return "ZSlider";
    }

    /**
     * Programmatically moves the handle to the given normalised position and
     * fires the callback.
     * @param t - A value in [0, 1] representing the handle position across the track.
     */
    setHandlePosition(t: number) {
        let handle = (this as any).handle;
        handle.x = t * this.sliderWidth!;
        if (this.callback) {
            this.callback(t);
        }
    };

    /**
     * Registers a function to be called whenever the slider value changes.
     * @param callback - Receives a normalised value in [0, 1].
     */
    setCallback(callback: (t: number) => void) {
        this.callback = callback;
    }

    /** Clears the registered value-change callback. */
    removeCallback() {
        this.callback = undefined;
    }


    /**
     * Starts a drag interaction: attaches pointer-up and pointer-move listeners
     * to both the handle and the window.
     * @param e - The pointer-down event that initiated the drag.
     */
    onDragStart(e: DragEvent) {
        this.dragging = true;
        let handle = (this as any).handle;
        handle.on("pointerup", this.onDragEndBinded);
        handle.on("pointerupoutside", this.onDragEndBinded);
        handle.on("touchend", this.onDragEndBinded);
        handle.on("touchendoutside", this.onDragEndBinded);
        window.addEventListener('pointerup', this.onDragEndBinded);
        window.addEventListener('touchend', this.onDragEndBinded);
        window.addEventListener('pointermove', this.onDragBinded);
        window.addEventListener('touchmove', this.onDragBinded);
    }

    /**
     * Ends a drag interaction: removes all pointer-up and pointer-move listeners.
     * @param e - The pointer-up event that ended the drag.
     */
    onDragEnd(e: DragEvent) {
        this.dragging = false;
        let handle = (this as any).handle;
        handle.off("pointerup", this.onDragEndBinded);
        handle.off("pointerupoutside", this.onDragEndBinded);
        handle.off("touchend", this.onDragEndBinded);
        handle.off("touchendoutside", this.onDragEndBinded);
        window.removeEventListener('pointerup', this.onDragEndBinded);
        window.removeEventListener('touchend', this.onDragEndBinded);
        window.removeEventListener('pointermove', this.onDragBinded);
        window.removeEventListener('touchmove', this.onDragBinded);
    }

    /**
     * Handles pointer movement during a drag. Converts the global pointer
     * position to local track space, clamps it to track bounds, moves the
     * handle, and fires the callback with a normalised [0, 1] value.
     * @param e - A PIXI `FederatedPointerEvent`, browser `PointerEvent`, or `TouchEvent`.
     */
    onDrag(e: DragEvent | PointerEvent | TouchEvent): void {
        let globalPoint: Point | undefined;
        if ('data' in e && e.data?.global) {
            // PIXI FederatedPointerEvent
            globalPoint = e.data.global;
        } else if ('clientX' in e) {
            // PointerEvent
            globalPoint = new Point((e as PointerEvent).clientX, (e as PointerEvent).clientY);
        } else if ('touches' in e && (e as TouchEvent).touches.length > 0) {
            // TouchEvent
            globalPoint = new Point((e as TouchEvent).touches[0].clientX, (e as TouchEvent).touches[0].clientY);
        }
        if (!globalPoint) return;

        let handle = (this as any).handle;
        let track = (this as any).track;
        // Convert the global pointer position to the handle's parent local coordinates
        const local = handle.parent.toLocal(globalPoint);
        // Clamp so that the handle's left edge stays within [0, sliderWidth]
        const minX = 0;
        const maxX = this.sliderWidth!;
        let clampedX = Math.max(minX, Math.min(local.x, maxX));
        handle.x = clampedX;

        // For the callback, t should be (handle.x - handle.pivot.x) / sliderWidth
        const t = (handle.x - handle.pivot.x) / this.sliderWidth!;
        if (this.callback) {
            this.callback(t);
        }
        if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
    }


}