import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import { CdkDrag, DragRef } from "@angular/cdk/drag-drop";
import { Point } from "@angular/cdk/drag-drop/typings/drag-ref";
import { Subscription, Subject } from "rxjs";
@Component({
  selector: "material-app",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent {
  public deg$ = new Subject<number>();

  private deg = 90;
  private radius = 0;
  @Output()
  public currentPosition = { x: 0, y: 0 };
  public ngAfterViewInit(): void {}

  public ngAfterContentChecked(): void {
    //if (this.radius === 0) {
    this.radius = this.getRadiusOfVisualDragHandle();
    console.log(`radius ${this.radius}`)
    this.positionDragHandleOnCircle();
    //}
  }
  /**
   * Customize the logic of how the position of the drag item is limited while it's being dragged.
   * @param  point current position of the user's pointer on the page
   * @param  dragRef reference to the draggable item
   * @returns Point adjusted location of the draggable item
   * @summary
   * Gets called with a point containing the current position of the user's pointer on the page
   * and should return a point describing where the item should be rendered.
   * In this case the returned point is the intersection point of a line through the center of the
   * viewer and the circle around the center that is designated for dragging around.
   * Side effects:
   * - @this.deg is updated
   * - @this.deg$ is notified
   */
  public constrainDragPositionToCircle = (point: Point): Point => {
    const parent = document.getElementById(
      "crossSectionContainerId"
    ) as HTMLElement;
    const parentRect = parent.getBoundingClientRect();
    const parentCenter = this.getCenter(parent);
    const vector = {
      x: point.x - parentCenter.x,
      y: point.y - parentCenter.y
    };

    // cartesian point
    const cVector = { x: vector.x, y: parentRect.height - vector.y };
    const rad = Math.atan2(
      cVector.y - parentCenter.y,
      cVector.x - parentCenter.x
    );
    // viewer point on circle, translated back
    const intersectionPoint = {
      x: parentCenter.x + this.radius * Math.cos(rad),
      y: parentCenter.y - this.radius * Math.sin(rad)
    };
    console.log(
      `P deg ${this.deg} center ${parentCenter.x}, ${parentCenter.x} new pos: ${
        intersectionPoint.x
      } ${intersectionPoint.y}`
    );

    // notify change in angle
    this.deg = (rad * 180) / Math.PI;
    this.deg$.next(this.deg);
    this.positionDragHandleOnCircle();

    return intersectionPoint;
  };

  private getCenter(el: HTMLElement): Point {
    const rect = el.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    return center;
  }

  private getVector(el1: HTMLElement, el2: HTMLElement): Point {
    const center1 = this.getCenter(el1);
    const center2 = this.getCenter(el2);
    const vector = {
      x: center2.x - center1.x,
      y: center2.y - center1.y
    };

    return vector;
  }

  private getRadiusOfVisualDragHandle(): number {
    let radius = 0;
    const visualDragHandle = document.getElementById(
      "visualCrossSectiondragHandleId"
    ) as HTMLElement;
    const parent = visualDragHandle
      ? (visualDragHandle.parentElement as HTMLElement)
      : undefined;
    if (visualDragHandle && parent) {
      const v = this.getVector(parent, visualDragHandle);
      radius = Math.sqrt(v.x * v.x + v.y * v.y);
    }

    return radius;
  }

  private positionDragHandleOnCircle(): void {
    const rad = (this.deg / 180) * Math.PI;
    const dragHandle = document.getElementById(
      "crossSectiondragHandleId"
    ) as HTMLElement;
    if (!dragHandle) {
      return;
    }
    const parent = dragHandle.parentElement;
    if (parent && dragHandle) {
      const center = { x: parent.clientWidth / 2, y: parent.clientHeight / 2 };
      const x = center.x + this.radius * Math.cos(rad);
      const y = center.y - this.radius * Math.sin(rad);

      this.currentPosition = {
        x: x - dragHandle.clientWidth / 2,
        y: y - dragHandle.clientHeight / 2
      };
    }
  }
  private increment() {
    this.deg += 45;
    this.positionDragHandleOnCircle();
  }
}
