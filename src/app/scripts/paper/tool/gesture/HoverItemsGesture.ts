import { ToolMode } from 'app/model/paper';
import { HitResult, HitTests } from 'app/scripts/paper/item';
import { Cursor, CursorUtil, PivotType } from 'app/scripts/paper/util';
import { PaperService } from 'app/services';
import * as _ from 'lodash';
import * as paper from 'paper';

import { Gesture } from './Gesture';

/**
 * A gesture that performs hover operations on items.
 *
 * Preconditions:
 * - The user is in selection mode.
 */
export class HoverItemsGesture extends Gesture {
  constructor(private readonly ps: PaperService) {
    super();
  }

  // @Override
  onMouseMove(event: paper.ToolEvent) {
    CursorUtil.clear();

    const selectedLayers = this.ps.getSelectedLayers();
    if (selectedLayers.size > 0) {
      // TODO: only perform a hit test if we are in focused path mode?
      const selectionBoundSegmentsHitResult = HitTests.selectionModeSegments(event.point);
      if (selectionBoundSegmentsHitResult) {
        const toolMode = this.ps.getToolMode();
        const cursorMap = toolMode === ToolMode.Rotate ? ROTATE_CURSOR_MAP : RESIZE_CURSOR_MAP;
        CursorUtil.set(cursorMap.get(selectionBoundSegmentsHitResult.item.pivotType));
        this.ps.setHoveredLayer(undefined);
        return;
      }
    }

    const { children } = HitTests.selectionMode(event.point);
    // TODO: make hit layer ID dependent on currently selected layers
    const firstHitResult = _.find(children, function recurseFn(hitResult: HitResult) {
      const firstChildHitResult = _.find(hitResult.children, recurseFn);
      if (firstChildHitResult) {
        return firstChildHitResult;
      }
      if (hitResult.hitItem && selectedLayers.has(hitResult.hitItem.data.id)) {
      }
    });
    if (firstHitResult && !selectedLayers.has(firstHitResult.hitItem.data.id)) {
      this.ps.setHoveredLayer(firstHitResult.hitItem.data.id);
    } else {
      this.ps.setHoveredLayer(undefined);
    }
  }
}

const RESIZE_CURSOR_MAP: ReadonlyMap<PivotType, Cursor> = new Map([
  ['bottomLeft', Cursor.Resize45],
  ['leftCenter', Cursor.Resize90],
  ['topLeft', Cursor.Resize135],
  ['topCenter', Cursor.Resize0],
  ['topRight', Cursor.Resize45],
  ['rightCenter', Cursor.Resize90],
  ['bottomRight', Cursor.Resize135],
  ['bottomCenter', Cursor.Resize0],
] as [PivotType, Cursor][]);

const ROTATE_CURSOR_MAP: ReadonlyMap<PivotType, Cursor> = new Map([
  ['bottomLeft', Cursor.Rotate225],
  ['leftCenter', Cursor.Rotate270],
  ['topLeft', Cursor.Rotate315],
  ['topCenter', Cursor.Rotate0],
  ['topRight', Cursor.Rotate45],
  ['rightCenter', Cursor.Rotate90],
  ['bottomRight', Cursor.Rotate135],
  ['bottomCenter', Cursor.Rotate180],
] as [PivotType, Cursor][]);
