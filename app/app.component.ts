import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import { CdkDrag, DragRef, Point } from "@angular/cdk/drag-drop";
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
  public ngAfterViewInit(): void {
    this.radius = this.getRadiusOfVisualDragHandle();
    this.positionDragHandleOnCircle();
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
  public constrainDragPositionToCircle = (
    point: Point,
    dragRef: DragRef
  ): Point => {
    const parent = document.getElementById("crossSectionContainerId");
    const parentOffset = this.getPosition(parent);
    const translatedPoint = {
      x: point.x - parentOffset.x,
      y: point.y - parentOffset.y
    };
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    const center = { x: w / 2, y: h / 2 };
    // cartesian point
    const cPoint = { x: translatedPoint.x, y: h - translatedPoint.y };
    const rad = Math.atan2(cPoint.y - center.y, cPoint.x - center.x);
    // viewer point on circle
    const intersectionPoint = {
      x: center.x + this.radius * Math.cos(rad) + parentOffset.x,
      y: center.y - this.radius * Math.sin(rad) + parentOffset.y
    };
    console.log(
      `P deg ${this.deg} center ${center.x}, ${center.x} new pos: ${
        intersectionPoint.x
      } ${intersectionPoint.y}`
    );

    // notify change in angle
    this.deg = (rad * 180) / Math.PI;
    this.deg$.next(this.deg);
    this.positionDragHandleOnCircle();
    return intersectionPoint;
  };

  private getPosition(el: HTMLElement): Point {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent as HTMLElement;
    }
    return { x: x, y: y };
  }

  private getCenter(el: HTMLElement): Point {
    const rect = el.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    return center;
  }

  private getVector(el1: HTMLElement, el2: HTMLElement): Point {
    if (el1 && el2) {
      const center1 = this.getCenter(el1);
      const center2 = this.getCenter(el2);
      const vector = {
        x: center2.x - center1.x,
        y: center2.y - center1.y
      };
      return vector;
    }
  }
  private getRadiusOfVisualDragHandle(): number {
    const parent = document.getElementById("crossSectionContainerId");
    const visualDragHandle = document.getElementById("visualcrossSectiondragHandleId");
    const v = this.getVector(parent, visualDragHandle);
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  private positionDragHandleOnCircle() {
    const rad = (this.deg / 180) * Math.PI;
    const parent = document.getElementById("crossSectionContainerId");
    const d = document.getElementById("crossSectiondragHandleId");
    if (parent && d) {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const center = { x: parent.clientWidth / 2, y: parent.clientHeight / 2 };
      const x = center.x + this.radius * Math.cos(rad);
      const y = center.y - this.radius * Math.sin(rad);

      this.currentPosition = {
        x: x - d.clientWidth / 2,
        y: y - d.clientHeight / 2
      };
    }
  }
  private increment() {
    this.deg += 45;
    this.positionDragHandleOnCircle();
  }
}
