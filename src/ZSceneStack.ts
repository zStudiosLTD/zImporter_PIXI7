import { ZContainer } from "./ZContainer";
import { ZScene } from "./ZScene";

/**
 * Manages a stack of `ZScene` instances, providing static methods to manipulate the stack.
 * 
 * This class allows pushing, popping, peeking, and clearing scenes from the stack.
 * It also provides utility methods to spawn entities from the topmost scene and resize all scenes in the stack.
 * 
 * @remarks
 * - The stack is implemented as a static array, so all operations affect the global stack.
 * - The stack size and top index are tracked separately for efficient access.
 * 
 * @public
 */
export class ZSceneStack {

    //the following is a stack of resources of tyoe T
    private static stack: ZScene[] = [];
    private static stackSize: number = 0;
    private static top: number = 0;


    /**
     * Pushes a scene onto the top of the stack.
     * @param resource - The `ZScene` to push.
     */
    public static push(resource: ZScene): void {
        this.stack[this.top] = resource;
        this.top++;
        this.stackSize++;

    }

    /**
     * Removes and returns the scene at the top of the stack.
     * @returns The removed `ZScene`, or `null` if the stack is empty.
     */
    public static pop(): ZScene | null {
        if (this.stackSize > 0) {
            this.top--;
            this.stackSize--;
            const scene = this.stack[this.top];
            // Drop the slot so a popped scene no longer receives resize or spawn calls.
            this.stack.length = this.top;
            return scene;
        }
        return null;
    }

    /**
     * Returns the scene at the top of the stack without removing it.
     * @returns The top `ZScene`, or `null` if the stack is empty.
     */
    public static peek(): ZScene | null {
        if (this.stackSize > 0) {
            return this.stack[this.top - 1];
        }
        return null;
    }

    /**
     * Returns the current number of scenes in the stack.
     * @returns The stack size.
     */
    public static getStackSize(): number {
        return this.stackSize;
    }

    /**
     * Removes all scenes from the stack and resets the size and top-of-stack index.
     */
    public static clear(): void {
        this.stack = [];
        this.stackSize = 0;
        this.top = 0;
    }


    //////

    /**
     * Searches the stack from top to bottom and calls `spawn(templateName)` on
     * each scene until one returns a container instance.
     * @param templateName - The template/asset name to spawn.
     * @returns The spawned `ZContainer`, or `undefined` if not found in any scene.
     */
    static spawn(templateName: string): ZContainer | undefined {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            let gameScene: ZScene = this.stack[i];
            let ent: ZContainer | undefined = gameScene.spawn(templateName);
            if (ent) {
                return ent;
            }
        }
    }

    /**
     * Calls `resize(width, height)` on every scene in the stack (top to bottom).
     * @param width - The new viewport width.
     * @param height - The new viewport height.
     */
    static resize(width: number, height: number): void {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            let gameScene: ZScene = this.stack[i];
            gameScene.resize(width, height);
        }
    }
}