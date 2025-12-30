import { AfterViewInit, ChangeDetectorRef, Component, ComponentRef, Directive, ElementRef, Inject, Input, ViewRef } from '@angular/core';
import { DialogPosition, MatDialogRef } from '@angular/material/dialog';

// magic number to account for the Dialog padding
const DIALOG_PADDING_PX = 24

@Directive({
  selector: '[appContextMenu]'
})
export class ContextMenuDirective implements AfterViewInit{
  @Input() recipient!: ContextMenuRecipient
  @Input() dialogRef!: MatDialogRef<any>

  constructor(private thiselt: ElementRef) { }


  // Repositions the RatingDialog either immediately if needed 
  // to ensure that the menu can be rendered in full, ie wont 
  // be clipped by the bottom or right side of the viewport.
  ngAfterViewInit(): void {
    const myDims = this.thiselt.nativeElement.getBoundingClientRect()
    const anchorDims= this.recipient.location

    let ntop=0, nleft = 0
    // if the menu fits in the window, position it to the right of 
    // the anchor, or to the left if it overflows on y axis
    if (anchorDims.right + myDims.width < window.innerWidth){
      nleft = anchorDims.right
    }
    else{
      nleft = anchorDims.left - myDims.width - (2*DIALOG_PADDING_PX)
    }

    // same logic for the top attribute
    if (anchorDims.top + myDims.height < window.innerHeight){
      ntop = anchorDims.top
    }
    else{
      ntop = anchorDims.bottom - myDims.height - (2*DIALOG_PADDING_PX)
    }

    const newPos: DialogPosition = {
      top: `${ntop}px`, 
      left: `${nleft}px`
    } 

    this.dialogRef.updatePosition(newPos)
  }


}

export interface ContextMenuRecipient{
  location: DOMRect;
}


