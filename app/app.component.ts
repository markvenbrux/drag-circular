import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import { CdkDrag, DragRef } from "@angular/cdk/drag-drop";
import { Point } from '@angular/cdk/drag-drop/typings/drag-ref';
import { Subscription, Subject } from "rxjs";
@Component({
  selector: "material-app",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent {
  public deg$ = new Subject<number>();

  @Output()
  public deg = 0;

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
    const parent = dragRef.data.element.nativeElement.parentElement;
    const parentOffset = this.getPosition(parent);
    const translatedPoint = {
      x: point.x - parentOffset.x,
      y: point.y - parentOffset.y
    };
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    const center = { x: w / 2, y: h / 2 };
    const radius = Math.min(w, h) * 0.3; // align with position of white dot
    // cartesian point
    const cPoint = { x: translatedPoint.x, y: h - translatedPoint.y };
    const rad = Math.atan2(cPoint.y - center.y, cPoint.x - center.x);
    // viewer point on circle
    const intersectionPoint = {
      x: center.x + radius * Math.cos(rad) + parentOffset.x,
      y: center.y - radius * Math.sin(rad) + parentOffset.y
    };

    // notify change in angle
    this.deg = (rad * 180) / Math.PI;
    this.deg$.next(this.deg);
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
  };

  increment() {
    this.deg += 10;
    const el = document.getElementById("containerId");
    const d =  document.getElementById("dragHandleId");
    const topLeft = this.getPosition(el);
    const w = el.clientWidth;
    const h = el.clientHeight;
    const center = { x: w / 2, y: h / 2 };
    const radius = Math.min(w, h) * 0.3; 
    const rad = (this.deg / 180) * Math.PI;

    d.style.left += "10px"
    d.style.top += "10px"
    
  }

}
