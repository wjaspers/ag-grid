/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v24.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants/constants");
var events_1 = require("../events");
var component_1 = require("../widgets/component");
var checkboxSelectionComponent_1 = require("./checkboxSelectionComponent");
var iRangeController_1 = require("../interfaces/iRangeController");
var rowDragComp_1 = require("./row/rowDragComp");
var popupEditorWrapper_1 = require("./cellEditors/popupEditorWrapper");
var dndSourceComp_1 = require("./dndSourceComp");
var tooltipFeature_1 = require("../widgets/tooltipFeature");
var aria_1 = require("../utils/aria");
var object_1 = require("../utils/object");
var string_1 = require("../utils/string");
var generic_1 = require("../utils/generic");
var dom_1 = require("../utils/dom");
var array_1 = require("../utils/array");
var general_1 = require("../utils/general");
var event_1 = require("../utils/event");
var keyboard_1 = require("../utils/keyboard");
var browser_1 = require("../utils/browser");
var function_1 = require("../utils/function");
var keyCode_1 = require("../constants/keyCode");
var CSS_CELL = 'ag-cell';
var CSS_CELL_VALUE = 'ag-cell-value';
var CSS_AUTO_HEIGHT = 'ag-cell-auto-height';
var CSS_RANGE_TOP = 'ag-cell-range-top';
var CSS_RANGE_RIGHT = 'ag-cell-range-right';
var CSS_RANGE_BOTTOM = 'ag-cell-range-bottom';
var CSS_RANGE_LEFT = 'ag-cell-range-left';
var CSS_CELL_FOCUS = 'ag-cell-focus';
var CSS_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
var CSS_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';
var CSS_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
var CSS_INLINE_EDITING = 'ag-cell-inline-editing';
var CSS_POPUP_EDITING = 'ag-cell-popup-editing';
var CSS_RANGE_SELECTED = 'ag-cell-range-selected';
var CSS_COLUMN_HOVER = 'ag-column-hover';
var CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';
var CSS_RANGE_CHART = 'ag-cell-range-chart';
var CSS_RANGE_SINGLE_CELL = 'ag-cell-range-single-cell';
var CSS_RANGE_CHART_CATEGORY = 'ag-cell-range-chart-category';
var CSS_RANGE_HANDLE = 'ag-cell-range-handle';
var CellComp = /** @class */ (function (_super) {
    __extends(CellComp, _super);
    function CellComp(scope, beans, column, rowNode, rowComp, autoHeightCell, printLayout) {
        var _this = _super.call(this) || this;
        _this.hasChartRange = false;
        _this.editingCell = false;
        _this.suppressRefreshCell = false;
        _this.tooltipFeatureEnabled = false;
        _this.scope = null;
        // every time we go into edit mode, or back again, this gets incremented.
        // it's the components way of dealing with the async nature of framework components,
        // so if a framework component takes a while to be created, we know if the object
        // is still relevant when creating is finished. eg we could click edit / un-edit 20
        // times before the first React edit component comes back - we should discard
        // the first 19.
        _this.cellEditorVersion = 0;
        _this.cellRendererVersion = 0;
        _this.scope = scope;
        _this.beans = beans;
        _this.column = column;
        _this.rowNode = rowNode;
        _this.rowComp = rowComp;
        _this.autoHeightCell = autoHeightCell;
        _this.printLayout = printLayout;
        _this.createGridCellVo();
        _this.rangeSelectionEnabled = _this.beans.rangeController && beans.gridOptionsWrapper.isEnableRangeSelection();
        _this.cellFocused = _this.beans.focusController.isCellFocused(_this.cellPosition);
        _this.firstRightPinned = _this.column.isFirstRightPinned();
        _this.lastLeftPinned = _this.column.isLastLeftPinned();
        if (_this.rangeSelectionEnabled && _this.beans.rangeController) {
            var rangeController = _this.beans.rangeController;
            _this.rangeCount = rangeController.getCellRangeCount(_this.cellPosition);
            _this.hasChartRange = _this.getHasChartRange();
        }
        _this.getValueAndFormat();
        _this.setUsingWrapper();
        _this.chooseCellRenderer();
        _this.setupColSpan();
        _this.rowSpan = _this.column.getRowSpan(_this.rowNode);
        return _this;
    }
    CellComp.prototype.getCreateTemplate = function () {
        var unselectable = !this.beans.gridOptionsWrapper.isEnableCellTextSelection() ? 'unselectable="on"' : '';
        var templateParts = [];
        var col = this.column;
        var width = this.getCellWidth();
        var left = this.modifyLeftForPrintLayout(this.getCellLeft());
        var valueToRender = this.getInitialValueToRender();
        var valueSanitised = object_1.get(this.column, 'colDef.template', null) ? valueToRender : string_1.escapeString(valueToRender);
        this.tooltip = this.getToolTip();
        var tooltipSanitised = string_1.escapeString(this.tooltip);
        var colIdSanitised = string_1.escapeString(col.getId());
        var wrapperStartTemplate = '';
        var wrapperEndTemplate = '';
        var stylesFromColDef = this.preProcessStylesFromColDef();
        var cssClasses = this.getInitialCssClasses();
        var stylesForRowSpanning = this.getStylesForRowSpanning();
        var colIdxSanitised = string_1.escapeString(this.beans.columnController.getAriaColumnIndex(this.column).toString());
        templateParts.push("<div");
        templateParts.push(" tabindex=\"-1\"");
        templateParts.push(" " + unselectable); // THIS IS FOR IE ONLY so text selection doesn't bubble outside of the grid
        templateParts.push(" role=\"gridcell\"");
        templateParts.push(" aria-colindex=\"" + colIdxSanitised + "\"");
        templateParts.push(" comp-id=\"" + this.getCompId() + "\" ");
        templateParts.push(" col-id=\"" + colIdSanitised + "\"");
        templateParts.push(" class=\"" + string_1.escapeString(cssClasses.join(' ')) + "\"");
        if (this.beans.gridOptionsWrapper.isEnableBrowserTooltips() && generic_1.exists(tooltipSanitised)) {
            templateParts.push(" title=\"" + tooltipSanitised + "\"");
        }
        if (this.rangeSelectionEnabled) {
            templateParts.push(" aria-selected=\"" + (this.rangeCount ? 'true' : 'false') + "\"");
        }
        if (this.usingWrapper) {
            wrapperStartTemplate =
                "<div ref=\"eCellWrapper\" class=\"ag-cell-wrapper\" role=\"presentation\">\n                    <span ref=\"eCellValue\" role=\"presentation\" class=\"" + CSS_CELL_VALUE + "\" " + unselectable + ">";
            wrapperEndTemplate = '</span></div>';
        }
        templateParts.push(" style=\"width: " + Number(width) + "px; left: " + Number(left) + "px; " + string_1.escapeString(stylesFromColDef) + " " + string_1.escapeString(stylesForRowSpanning) + "\">");
        templateParts.push(wrapperStartTemplate);
        if (generic_1.exists(valueSanitised, true)) {
            templateParts.push(valueSanitised);
        }
        templateParts.push(wrapperEndTemplate);
        templateParts.push("</div>");
        return templateParts.join('');
    };
    CellComp.prototype.getStylesForRowSpanning = function () {
        if (this.rowSpan === 1) {
            return '';
        }
        var singleRowHeight = this.beans.gridOptionsWrapper.getRowHeightAsNumber();
        var totalRowHeight = singleRowHeight * this.rowSpan;
        return "height: " + totalRowHeight + "px; z-index: 1;";
    };
    CellComp.prototype.afterAttached = function () {
        var querySelector = "[comp-id=\"" + this.getCompId() + "\"]";
        var eGui = this.eParentRow.querySelector(querySelector);
        this.setGui(eGui);
        // all of these have dependencies on the eGui, so only do them after eGui is set
        this.addDomData();
        this.populateTemplate();
        this.createCellRendererInstance(true);
        this.angular1Compile();
        this.refreshHandle();
        if (generic_1.exists(this.tooltip)) {
            this.createTooltipFeatureIfNeeded();
        }
    };
    CellComp.prototype.createTooltipFeatureIfNeeded = function () {
        if (this.beans.gridOptionsWrapper.isEnableBrowserTooltips() ||
            this.tooltipFeatureEnabled) {
            return;
        }
        this.createManagedBean(new tooltipFeature_1.TooltipFeature(this, 'cell'), this.beans.context);
        this.tooltipFeatureEnabled = true;
    };
    CellComp.prototype.onColumnHover = function () {
        var isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    };
    CellComp.prototype.onCellChanged = function (event) {
        var eventImpactsThisCell = event.column === this.column;
        if (eventImpactsThisCell) {
            this.refreshCell({});
        }
    };
    CellComp.prototype.getCellLeft = function () {
        var mostLeftCol;
        if (this.beans.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            mostLeftCol = array_1.last(this.colsSpanning);
        }
        else {
            mostLeftCol = this.column;
        }
        return mostLeftCol.getLeft();
    };
    CellComp.prototype.getCellWidth = function () {
        if (!this.colsSpanning) {
            return this.column.getActualWidth();
        }
        return this.colsSpanning.reduce(function (width, col) { return width + col.getActualWidth(); }, 0);
    };
    CellComp.prototype.onFlashCells = function (event) {
        var cellId = this.beans.cellPositionUtils.createId(this.cellPosition);
        var shouldFlash = event.cells[cellId];
        if (shouldFlash) {
            this.animateCell('highlight');
        }
    };
    CellComp.prototype.setupColSpan = function () {
        // if no col span is active, then we don't set it up, as it would be wasteful of CPU
        if (generic_1.missing(this.getComponentHolder().colSpan)) {
            return;
        }
        // because we are col spanning, a reorder of the cols can change what cols we are spanning over
        this.addManagedListener(this.beans.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayColumnsChanged.bind(this));
        // because we are spanning over multiple cols, we check for width any time any cols width changes.
        // this is expensive - really we should be explicitly checking only the cols we are spanning over
        // instead of every col, however it would be tricky code to track the cols we are spanning over, so
        // because hardly anyone will be using colSpan, am favouring this easier way for more maintainable code.
        this.addManagedListener(this.beans.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onWidthChanged.bind(this));
        this.colsSpanning = this.getColSpanningList();
    };
    CellComp.prototype.getColSpanningList = function () {
        var colSpan = this.column.getColSpan(this.rowNode);
        var colsSpanning = [];
        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(this.column);
        }
        else {
            var pointer = this.column;
            var pinned = this.column.getPinned();
            for (var i = 0; pointer && i < colSpan; i++) {
                colsSpanning.push(pointer);
                pointer = this.beans.columnController.getDisplayedColAfter(pointer);
                if (!pointer || generic_1.missing(pointer)) {
                    break;
                }
                // we do not allow col spanning to span outside of pinned areas
                if (pinned !== pointer.getPinned()) {
                    break;
                }
            }
        }
        return colsSpanning;
    };
    CellComp.prototype.onDisplayColumnsChanged = function () {
        var colsSpanning = this.getColSpanningList();
        if (!array_1.areEqual(this.colsSpanning, colsSpanning)) {
            this.colsSpanning = colsSpanning;
            this.onWidthChanged();
            this.onLeftChanged(); // left changes when doing RTL
        }
    };
    CellComp.prototype.refreshAriaIndex = function () {
        var colIdx = this.beans.columnController.getAriaColumnIndex(this.column);
        aria_1.setAriaColIndex(this.getGui(), colIdx);
    };
    CellComp.prototype.getInitialCssClasses = function () {
        var cssClasses = [CSS_CELL, CSS_NOT_INLINE_EDITING];
        // if we are putting the cell into a dummy container, to work out it's height,
        // then we don't put the height css in, as we want cell to fit height in that case.
        if (!this.autoHeightCell) {
            cssClasses.push(CSS_AUTO_HEIGHT);
        }
        var doingFocusCss = !this.beans.gridOptionsWrapper.isSuppressCellSelection();
        if (doingFocusCss && this.cellFocused) {
            // otherwise the class depends on the focus state
            cssClasses.push(CSS_CELL_FOCUS);
        }
        if (this.firstRightPinned) {
            cssClasses.push(CSS_FIRST_RIGHT_PINNED);
        }
        if (this.lastLeftPinned) {
            cssClasses.push(CSS_LAST_LEFT_PINNED);
        }
        if (this.beans.columnHoverService.isHovered(this.column)) {
            cssClasses.push(CSS_COLUMN_HOVER);
        }
        array_1.pushAll(cssClasses, this.preProcessClassesFromColDef());
        array_1.pushAll(cssClasses, this.preProcessCellClassRules());
        array_1.pushAll(cssClasses, this.getInitialRangeClasses());
        // if using the wrapper, this class goes on the wrapper instead
        if (!this.usingWrapper) {
            cssClasses.push(CSS_CELL_VALUE);
        }
        if (this.column.getColDef().wrapText) {
            cssClasses.push(CSS_CELL_WRAP_TEXT);
        }
        return cssClasses;
    };
    CellComp.prototype.getInitialValueToRender = function () {
        // if using a cellRenderer, then render the html from the cell renderer if it exists
        if (this.usingCellRenderer) {
            if (typeof this.cellRendererGui === 'string') {
                return this.cellRendererGui;
            }
            return '';
        }
        var colDef = this.getComponentHolder();
        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            return colDef.template;
        }
        if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            var template = this.beans.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            return template || '';
        }
        return this.getValueToUse();
    };
    CellComp.prototype.getRenderedRow = function () {
        return this.rowComp;
    };
    CellComp.prototype.isSuppressNavigable = function () {
        return this.column.isSuppressNavigable(this.rowNode);
    };
    CellComp.prototype.getCellRenderer = function () {
        return this.cellRenderer;
    };
    CellComp.prototype.getCellEditor = function () {
        return this.cellEditor;
    };
    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowComp: event dataChanged {animate: update, newData: !update}
    // + rowComp: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    CellComp.prototype.refreshCell = function (params) {
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (this.suppressRefreshCell || this.editingCell) {
            return;
        }
        var colDef = this.getComponentHolder();
        var newData = params && params.newData;
        var suppressFlash = (params && params.suppressFlash) || colDef.suppressCellFlash;
        var forceRefresh = params && params.forceRefresh;
        var oldValue = this.value;
        // get latest value without invoking the value formatter as we may not be updating the cell
        this.value = this.getValue();
        // for simple values only (not objects), see if the value is the same, and if it is, skip the refresh.
        // when never allow skipping after an edit, as after editing, we need to put the GUI back to the way
        // if was before the edit.
        var valuesDifferent = !this.valuesAreEqual(oldValue, this.value);
        var dataNeedsUpdating = forceRefresh || valuesDifferent;
        if (dataNeedsUpdating) {
            // now invoke the value formatter as we are going to update cell
            this.valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, this.value);
            // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
            // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
            // then we are not showing a movement in the stock price, rather we are showing different stock.
            var cellRendererRefreshed = newData ? false : this.attemptCellRendererRefresh();
            // we do the replace if not doing refresh, or if refresh was unsuccessful.
            // the refresh can be unsuccessful if we are using a framework (eg ng2 or react) and the framework
            // wrapper has the refresh method, but the underlying component doesn't
            if (!cellRendererRefreshed) {
                this.replaceContentsAfterRefresh();
            }
            // we don't want to flash the cells when processing a filter change, as otherwise the UI would
            // be to busy. see comment in FilterManager with regards processingFilterChange
            var processingFilterChange = this.beans.filterManager.isSuppressFlashingCellsBecauseFiltering();
            var flashCell = !suppressFlash && !processingFilterChange &&
                (this.beans.gridOptionsWrapper.isEnableCellChangeFlash() || colDef.enableCellChangeFlash);
            if (flashCell) {
                this.flashCell();
            }
            // need to check rules. note, we ignore colDef classes and styles, these are assumed to be static
            this.postProcessStylesFromColDef();
            this.postProcessClassesFromColDef();
        }
        // we can't readily determine if the data in an angularjs template has changed, so here we just update
        // and recompile (if applicable)
        this.updateAngular1ScopeAndCompile();
        this.refreshToolTip();
        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.postProcessCellClassRules();
    };
    // user can also call this via API
    CellComp.prototype.flashCell = function (delays) {
        var flashDelay = delays && delays.flashDelay;
        var fadeDelay = delays && delays.fadeDelay;
        this.animateCell('data-changed', flashDelay, fadeDelay);
    };
    CellComp.prototype.animateCell = function (cssName, flashDelay, fadeDelay) {
        var _this = this;
        var fullName = "ag-cell-" + cssName;
        var animationFullName = "ag-cell-" + cssName + "-animation";
        var element = this.getGui();
        var gridOptionsWrapper = this.beans.gridOptionsWrapper;
        if (!flashDelay) {
            flashDelay = gridOptionsWrapper.getCellFlashDelay();
        }
        if (!fadeDelay) {
            fadeDelay = gridOptionsWrapper.getCellFadeDelay();
        }
        // we want to highlight the cells, without any animation
        this.addCssClass(fullName);
        this.removeCssClass(animationFullName);
        // then once that is applied, we remove the highlight with animation
        window.setTimeout(function () {
            _this.removeCssClass(fullName);
            _this.addCssClass(animationFullName);
            element.style.transition = "background-color " + fadeDelay + "ms";
            window.setTimeout(function () {
                // and then to leave things as we got them, we remove the animation
                _this.removeCssClass(animationFullName);
                element.style.transition = null;
            }, fadeDelay);
        }, flashDelay);
    };
    CellComp.prototype.replaceContentsAfterRefresh = function () {
        // otherwise we rip out the cell and replace it
        dom_1.clearElement(this.eCellValue);
        // remove old renderer component if it exists
        this.cellRenderer = this.beans.context.destroyBean(this.cellRenderer);
        this.cellRendererGui = null;
        // populate
        this.putDataIntoCellAfterRefresh();
        this.updateAngular1ScopeAndCompile();
    };
    CellComp.prototype.updateAngular1ScopeAndCompile = function () {
        if (this.beans.gridOptionsWrapper.isAngularCompileRows() && this.scope) {
            this.scope.data = __assign({}, this.rowNode.data);
            this.angular1Compile();
        }
    };
    CellComp.prototype.angular1Compile = function () {
        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
        if (this.beans.gridOptionsWrapper.isAngularCompileRows()) {
            var eGui = this.getGui();
            // only compile the node if it hasn't already been done
            // this prevents "orphaned" node leaks
            if (!eGui.classList.contains('ng-scope') || eGui.childElementCount === 0) {
                var compiledElement_1 = this.beans.$compile(eGui)(this.scope);
                this.addDestroyFunc(function () { return compiledElement_1.remove(); });
            }
        }
    };
    CellComp.prototype.postProcessStylesFromColDef = function () {
        var stylesToUse = this.processStylesFromColDef();
        if (stylesToUse) {
            dom_1.addStylesToElement(this.getGui(), stylesToUse);
        }
    };
    CellComp.prototype.preProcessStylesFromColDef = function () {
        return general_1.cssStyleObjectToMarkup(this.processStylesFromColDef());
    };
    CellComp.prototype.processStylesFromColDef = function () {
        var colDef = this.getComponentHolder();
        if (colDef.cellStyle) {
            var cssToUse = void 0;
            if (typeof colDef.cellStyle === 'function') {
                var cellStyleParams = {
                    value: this.value,
                    data: this.rowNode.data,
                    node: this.rowNode,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    context: this.beans.gridOptionsWrapper.getContext(),
                    api: this.beans.gridOptionsWrapper.getApi()
                };
                var cellStyleFunc = colDef.cellStyle;
                cssToUse = cellStyleFunc(cellStyleParams);
            }
            else {
                cssToUse = colDef.cellStyle;
            }
            return cssToUse;
        }
    };
    CellComp.prototype.postProcessClassesFromColDef = function () {
        var _this = this;
        this.processClassesFromColDef(function (className) { return _this.addCssClass(className); });
    };
    CellComp.prototype.preProcessClassesFromColDef = function () {
        var res = [];
        this.processClassesFromColDef(function (className) { return res.push(className); });
        return res;
    };
    CellComp.prototype.processClassesFromColDef = function (onApplicableClass) {
        var colDef = this.getComponentHolder();
        this.beans.stylingService.processStaticCellClasses(colDef, {
            value: this.value,
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            rowIndex: this.rowNode.rowIndex,
            $scope: this.scope,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        }, onApplicableClass);
    };
    CellComp.prototype.putDataIntoCellAfterRefresh = function () {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.getComponentHolder();
        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            this.eCellValue.innerHTML = colDef.template;
        }
        else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            var template = this.beans.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.eCellValue.innerHTML = template;
            }
        }
        else {
            // we can switch from using a cell renderer back to the default if a user
            // is using cellRendererSelect
            this.chooseCellRenderer();
            if (this.usingCellRenderer) {
                this.createCellRendererInstance();
            }
            else {
                var valueToUse = this.getValueToUse();
                if (valueToUse != null) {
                    this.eCellValue.innerHTML = string_1.escapeString(valueToUse);
                }
            }
        }
    };
    CellComp.prototype.attemptCellRendererRefresh = function () {
        if (generic_1.missing(this.cellRenderer) || !this.cellRenderer || generic_1.missing(this.cellRenderer.refresh)) {
            return false;
        }
        // if the cell renderer has a refresh method, we call this instead of doing a refresh
        var params = this.createCellRendererParams();
        // take any custom params off of the user
        var finalParams = this.beans.userComponentFactory.createFinalParams(this.getComponentHolder(), this.cellRendererType, params);
        var result = this.cellRenderer.refresh(finalParams);
        // NOTE on undefined: previous version of the cellRenderer.refresh() interface
        // returned nothing, if the method existed, we assumed it refreshed. so for
        // backwards compatibility, we assume if method exists and returns nothing,
        // that it was successful.
        return result === true || result === undefined;
    };
    CellComp.prototype.refreshToolTip = function () {
        var newTooltip = this.getToolTip();
        if (this.tooltip === newTooltip) {
            return;
        }
        this.createTooltipFeatureIfNeeded();
        var hasNewTooltip = generic_1.exists(newTooltip);
        if (hasNewTooltip && this.tooltip === newTooltip.toString()) {
            return;
        }
        this.tooltip = newTooltip;
        if (this.beans.gridOptionsWrapper.isEnableBrowserTooltips()) {
            if (hasNewTooltip) {
                this.eCellValue.setAttribute('title', this.tooltip);
            }
            else {
                this.eCellValue.removeAttribute('title');
            }
        }
    };
    CellComp.prototype.valuesAreEqual = function (val1, val2) {
        // if the user provided an equals method, use that, otherwise do simple comparison
        var colDef = this.getComponentHolder();
        var equalsMethod = colDef ? colDef.equals : null;
        return equalsMethod ? equalsMethod(val1, val2) : val1 === val2;
    };
    CellComp.prototype.getToolTip = function () {
        var colDef = this.getComponentHolder();
        var data = this.rowNode.data;
        if (colDef.tooltipField && generic_1.exists(data)) {
            return object_1.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
        }
        var valueGetter = colDef.tooltipValueGetter;
        if (valueGetter) {
            return valueGetter({
                api: this.beans.gridOptionsWrapper.getApi(),
                columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
                colDef: colDef,
                column: this.getColumn(),
                context: this.beans.gridOptionsWrapper.getContext(),
                value: this.value,
                valueFormatted: this.valueFormatted,
                rowIndex: this.cellPosition.rowIndex,
                node: this.rowNode,
                data: this.rowNode.data
            });
        }
        return null;
    };
    CellComp.prototype.getTooltipText = function (escape) {
        if (escape === void 0) { escape = true; }
        return escape ? string_1.escapeString(this.tooltip) : this.tooltip;
    };
    CellComp.prototype.processCellClassRules = function (onApplicableClass, onNotApplicableClass) {
        var colDef = this.getComponentHolder();
        this.beans.stylingService.processClassRules(colDef.cellClassRules, {
            value: this.value,
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            rowIndex: this.cellPosition.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            $scope: this.scope,
            context: this.beans.gridOptionsWrapper.getContext()
        }, onApplicableClass, onNotApplicableClass);
    };
    CellComp.prototype.postProcessCellClassRules = function () {
        var _this = this;
        this.processCellClassRules(function (className) { return _this.addCssClass(className); }, function (className) { return _this.removeCssClass(className); });
    };
    CellComp.prototype.preProcessCellClassRules = function () {
        var res = [];
        this.processCellClassRules(function (className) { return res.push(className); }, function (_) {
            // not catered for, if creating, no need
            // to remove class as it was never there
        });
        return res;
    };
    // a wrapper is used when we are putting a selection checkbox in the cell with the value
    CellComp.prototype.setUsingWrapper = function () {
        var colDef = this.getComponentHolder();
        // never allow selection or dragging on pinned rows
        if (this.rowNode.rowPinned) {
            this.usingWrapper = false;
            this.includeSelectionComponent = false;
            this.includeRowDraggingComponent = false;
            this.includeDndSourceComponent = false;
            return;
        }
        var cbSelectionIsFunc = typeof colDef.checkboxSelection === 'function';
        var rowDraggableIsFunc = typeof colDef.rowDrag === 'function';
        var dndSourceIsFunc = typeof colDef.dndSource === 'function';
        this.includeSelectionComponent = cbSelectionIsFunc || colDef.checkboxSelection === true;
        this.includeRowDraggingComponent = rowDraggableIsFunc || colDef.rowDrag === true;
        this.includeDndSourceComponent = dndSourceIsFunc || colDef.dndSource === true;
        var enableTextSelection = this.beans.gridOptionsWrapper.isEnableCellTextSelection();
        this.usingWrapper = enableTextSelection || this.includeRowDraggingComponent || this.includeSelectionComponent || this.includeDndSourceComponent;
    };
    CellComp.prototype.chooseCellRenderer = function () {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.getComponentHolder();
        // templates are for ng1, ideally we wouldn't have these, they are ng1 support
        // inside the core which is bad
        if (colDef.template || colDef.templateUrl) {
            this.usingCellRenderer = false;
            return;
        }
        var params = this.createCellRendererParams();
        var cellRenderer = this.beans.userComponentFactory.lookupComponentClassDef(colDef, 'cellRenderer', params);
        var pinnedRowCellRenderer = this.beans.userComponentFactory.lookupComponentClassDef(colDef, 'pinnedRowCellRenderer', params);
        if (pinnedRowCellRenderer && this.rowNode.rowPinned) {
            this.cellRendererType = CellComp.CELL_RENDERER_TYPE_PINNED;
            this.usingCellRenderer = true;
        }
        else if (cellRenderer) {
            this.cellRendererType = CellComp.CELL_RENDERER_TYPE_NORMAL;
            this.usingCellRenderer = true;
        }
        else {
            this.usingCellRenderer = false;
        }
    };
    CellComp.prototype.createCellRendererInstance = function (useTaskService) {
        var _this = this;
        if (useTaskService === void 0) { useTaskService = false; }
        if (!this.usingCellRenderer) {
            return;
        }
        // never use task service if angularCompileRows=true, as that assume the cell renderers
        // are finished when the row is created. also we never use it if animation frame service
        // is turned off.
        // and lastly we never use it if doing auto-height, as the auto-height service checks the
        // row height directly after the cell is created, it doesn't wait around for the tasks to complete
        var angularCompileRows = this.beans.gridOptionsWrapper.isAngularCompileRows();
        var suppressAnimationFrame = this.beans.gridOptionsWrapper.isSuppressAnimationFrame();
        if (angularCompileRows || suppressAnimationFrame || this.autoHeightCell) {
            useTaskService = false;
        }
        var params = this.createCellRendererParams();
        this.cellRendererVersion++;
        var callback = this.afterCellRendererCreated.bind(this, this.cellRendererVersion);
        var cellRendererTypeNormal = this.cellRendererType === CellComp.CELL_RENDERER_TYPE_NORMAL;
        this.createCellRendererFunc = function () {
            _this.createCellRendererFunc = null;
            // this can return null in the event that the user has switched from a renderer component to nothing, for example
            // when using a cellRendererSelect to return a component or null depending on row data etc
            var componentPromise = _this.beans.userComponentFactory.newCellRenderer(_this.getComponentHolder(), params, !cellRendererTypeNormal);
            if (componentPromise) {
                componentPromise.then(callback);
            }
        };
        if (useTaskService) {
            this.beans.taskQueue.createTask(this.createCellRendererFunc, this.rowNode.rowIndex, 'createTasksP2');
        }
        else {
            this.createCellRendererFunc();
        }
    };
    CellComp.prototype.afterCellRendererCreated = function (cellRendererVersion, cellRenderer) {
        var cellRendererNotRequired = !this.isAlive() || (cellRendererVersion !== this.cellRendererVersion);
        if (cellRendererNotRequired) {
            this.beans.context.destroyBean(cellRenderer);
            return;
        }
        this.cellRenderer = cellRenderer;
        this.cellRendererGui = this.cellRenderer.getGui();
        if (generic_1.missing(this.cellRendererGui)) {
            return;
        }
        // if async components, then it's possible the user started editing since this call was made
        if (!this.editingCell) {
            this.eCellValue.appendChild(this.cellRendererGui);
        }
    };
    CellComp.prototype.createCellRendererParams = function () {
        var _this = this;
        return {
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: this.getValue.bind(this),
            setValue: function (value) { return _this.beans.valueService.setValue(_this.rowNode, _this.column, value); },
            formatValue: this.formatValue.bind(this),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: this.getComponentHolder(),
            column: this.column,
            $scope: this.scope,
            rowIndex: this.cellPosition.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.getGui(),
            eParentOfValue: this.eCellValue,
            // these bits are not documented anywhere, so we could drop them?
            // it was in the olden days to allow user to register for when rendered
            // row was removed (the row comp was removed), however now that the user
            // can provide components for cells, the destroy method gets call when this
            // happens so no longer need to fire event.
            addRowCompListener: this.rowComp ? this.rowComp.addEventListener.bind(this.rowComp) : null,
            addRenderedRowListener: function (eventType, listener) {
                console.warn('ag-Grid: since ag-Grid .v11, params.addRenderedRowListener() is now params.addRowCompListener()');
                if (_this.rowComp) {
                    _this.rowComp.addEventListener(eventType, listener);
                }
            }
        };
    };
    CellComp.prototype.formatValue = function (value) {
        var valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, value);
        return valueFormatted != null ? valueFormatted : value;
    };
    CellComp.prototype.getValueToUse = function () {
        return this.valueFormatted != null ? this.valueFormatted : this.value;
    };
    CellComp.prototype.getValueAndFormat = function () {
        this.value = this.getValue();
        this.valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, this.value);
    };
    CellComp.prototype.getValue = function () {
        // if we don't check this, then the grid will render leaf groups as open even if we are not
        // allowing the user to open leaf groups. confused? remember for pivot mode we don't allow
        // opening leaf groups, so we have to force leafGroups to be closed in case the user expanded
        // them via the API, or user user expanded them in the UI before turning on pivot mode
        var lockedClosedGroup = this.rowNode.leafGroup && this.beans.columnController.isPivotMode();
        var isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer && !lockedClosedGroup;
        // are we showing group footers
        var groupFootersEnabled = this.beans.gridOptionsWrapper.isGroupIncludeFooter();
        // if doing footers, we normally don't show agg data at group level when group is open
        var groupAlwaysShowAggData = this.beans.gridOptionsWrapper.isGroupSuppressBlankHeader();
        // if doing grouping and footers, we don't want to include the agg value
        // in the header when the group is open
        var ignoreAggData = (isOpenGroup && groupFootersEnabled) && !groupAlwaysShowAggData;
        return this.beans.valueService.getValue(this.column, this.rowNode, false, ignoreAggData);
    };
    CellComp.prototype.onMouseEvent = function (eventName, mouseEvent) {
        if (event_1.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        switch (eventName) {
            case 'click':
                this.onCellClicked(mouseEvent);
                break;
            case 'mousedown':
                this.onMouseDown(mouseEvent);
                break;
            case 'dblclick':
                this.onCellDoubleClicked(mouseEvent);
                break;
            case 'mouseout':
                this.onMouseOut(mouseEvent);
                break;
            case 'mouseover':
                this.onMouseOver(mouseEvent);
                break;
        }
    };
    CellComp.prototype.dispatchCellContextMenuEvent = function (event) {
        var colDef = this.getComponentHolder();
        var cellContextMenuEvent = this.createEvent(event, events_1.Events.EVENT_CELL_CONTEXT_MENU);
        this.beans.eventService.dispatchEvent(cellContextMenuEvent);
        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            window.setTimeout(function () { return colDef.onCellContextMenu(cellContextMenuEvent); }, 0);
        }
    };
    CellComp.prototype.createEvent = function (domEvent, eventType) {
        var event = {
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.value,
            column: this.column,
            colDef: this.getComponentHolder(),
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridApi,
            columnApi: this.beans.columnApi,
            rowPinned: this.rowNode.rowPinned,
            event: domEvent,
            type: eventType,
            rowIndex: this.rowNode.rowIndex
        };
        // because we are hacking in $scope for angular 1, we have to de-reference
        if (this.scope) {
            event.$scope = this.scope;
        }
        return event;
    };
    CellComp.prototype.onMouseOut = function (mouseEvent) {
        var cellMouseOutEvent = this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_OUT);
        this.beans.eventService.dispatchEvent(cellMouseOutEvent);
        this.beans.columnHoverService.clearMouseOver();
    };
    CellComp.prototype.onMouseOver = function (mouseEvent) {
        var cellMouseOverEvent = this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_OVER);
        this.beans.eventService.dispatchEvent(cellMouseOverEvent);
        this.beans.columnHoverService.setMouseOver([this.column]);
    };
    CellComp.prototype.onCellDoubleClicked = function (mouseEvent) {
        var colDef = this.getComponentHolder();
        // always dispatch event to eventService
        var cellDoubleClickedEvent = this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_DOUBLE_CLICKED);
        this.beans.eventService.dispatchEvent(cellDoubleClickedEvent);
        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            // to make the callback async, do in a timeout
            window.setTimeout(function () { return colDef.onCellDoubleClicked(cellDoubleClickedEvent); }, 0);
        }
        var editOnDoubleClick = !this.beans.gridOptionsWrapper.isSingleClickEdit()
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnDoubleClick) {
            this.startRowOrCellEdit();
        }
    };
    // called by rowRenderer when user navigates via tab key
    CellComp.prototype.startRowOrCellEdit = function (keyPress, charPress) {
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowComp.startRowEditing(keyPress, charPress, this);
        }
        else {
            this.startEditingIfEnabled(keyPress, charPress, true);
        }
    };
    CellComp.prototype.isCellEditable = function () {
        return this.column.isCellEditable(this.rowNode);
    };
    // either called internally if single cell editing, or called by rowRenderer if row editing
    CellComp.prototype.startEditingIfEnabled = function (keyPress, charPress, cellStartedEdit) {
        if (keyPress === void 0) { keyPress = null; }
        if (charPress === void 0) { charPress = null; }
        if (cellStartedEdit === void 0) { cellStartedEdit = false; }
        // don't do it if not editable
        if (!this.isCellEditable()) {
            return;
        }
        // don't do it if already editing
        if (this.editingCell) {
            return;
        }
        this.editingCell = true;
        this.cellEditorVersion++;
        var callback = this.afterCellEditorCreated.bind(this, this.cellEditorVersion);
        var params = this.createCellEditorParams(keyPress, charPress, cellStartedEdit);
        this.createCellEditor(params).then(callback);
        // if we don't do this, and editor component is async, then there will be a period
        // when the component isn't present and keyboard navigation won't work - so example
        // of user hitting tab quickly (more quickly than renderers getting created) won't work
        var cellEditorAsync = generic_1.missing(this.cellEditor);
        if (cellEditorAsync && cellStartedEdit) {
            this.focusCell(true);
        }
    };
    CellComp.prototype.createCellEditor = function (params) {
        var _this = this;
        var cellEditorPromise = this.beans.userComponentFactory.newCellEditor(this.column.getColDef(), params);
        return cellEditorPromise.then(function (cellEditor) {
            var isPopup = cellEditor.isPopup && cellEditor.isPopup();
            if (!isPopup) {
                return cellEditor;
            }
            if (_this.beans.gridOptionsWrapper.isFullRowEdit()) {
                console.warn('ag-Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                    '- either turn off fullRowEdit, or stop using popup editors.');
            }
            // if a popup, then we wrap in a popup editor and return the popup
            var popupEditorWrapper = new popupEditorWrapper_1.PopupEditorWrapper(cellEditor);
            _this.beans.context.createBean(popupEditorWrapper);
            popupEditorWrapper.init(params);
            return popupEditorWrapper;
        });
    };
    CellComp.prototype.afterCellEditorCreated = function (cellEditorVersion, cellEditor) {
        // if editingCell=false, means user cancelled the editor before component was ready.
        // if versionMismatch, then user cancelled the edit, then started the edit again, and this
        //   is the first editor which is now stale.
        var versionMismatch = cellEditorVersion !== this.cellEditorVersion;
        var cellEditorNotNeeded = versionMismatch || !this.editingCell;
        if (cellEditorNotNeeded) {
            this.beans.context.destroyBean(cellEditor);
            return;
        }
        var editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
        if (editingCancelledByUserComp) {
            this.beans.context.destroyBean(cellEditor);
            this.editingCell = false;
            return;
        }
        if (!cellEditor.getGui) {
            console.warn("ag-Grid: cellEditor for column " + this.column.getId() + " is missing getGui() method");
            // no getGui, for React guys, see if they attached a react component directly
            if (cellEditor.render) {
                console.warn("ag-Grid: we found 'render' on the component, are you trying to set a React renderer but added it as colDef.cellEditor instead of colDef.cellEditorFmk?");
            }
            this.beans.context.destroyBean(cellEditor);
            this.editingCell = false;
            return;
        }
        this.cellEditor = cellEditor;
        this.cellEditorInPopup = cellEditor.isPopup !== undefined && cellEditor.isPopup();
        this.setInlineEditingClass();
        if (this.cellEditorInPopup) {
            this.addPopupCellEditor();
        }
        else {
            this.addInCellEditor();
        }
        if (cellEditor.afterGuiAttached) {
            cellEditor.afterGuiAttached();
        }
        var event = this.createEvent(null, events_1.Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(event);
    };
    CellComp.prototype.addInCellEditor = function () {
        dom_1.clearElement(this.getGui());
        if (this.cellEditor) {
            this.getGui().appendChild(this.cellEditor.getGui());
        }
        this.angular1Compile();
    };
    CellComp.prototype.addPopupCellEditor = function () {
        var _this = this;
        var ePopupGui = this.cellEditor ? this.cellEditor.getGui() : null;
        var useModelPopup = this.beans.gridOptionsWrapper.isStopEditingWhenGridLosesFocus();
        this.hideEditorPopup = this.beans.popupService.addPopup({
            modal: useModelPopup,
            eChild: ePopupGui,
            closeOnEsc: true,
            closedCallback: function () { _this.onPopupEditorClosed(); }
        });
        var params = {
            column: this.column,
            rowNode: this.rowNode,
            type: 'popupCellEditor',
            eventSource: this.getGui(),
            ePopup: ePopupGui,
            keepWithinBounds: true
        };
        var position = this.cellEditor && this.cellEditor.getPopupPosition ? this.cellEditor.getPopupPosition() : 'over';
        if (position === 'under') {
            this.beans.popupService.positionPopupUnderComponent(params);
        }
        else {
            this.beans.popupService.positionPopupOverComponent(params);
        }
        this.angular1Compile();
    };
    CellComp.prototype.onPopupEditorClosed = function () {
        // we only call stopEditing if we are editing, as
        // it's possible the popup called 'stop editing'
        // before this, eg if 'enter key' was pressed on
        // the editor.
        if (this.editingCell) {
            // note: this only happens when use clicks outside of the grid. if use clicks on another
            // cell, then the editing will have already stopped on this cell
            this.stopRowOrCellEdit();
            // we only focus cell again if this cell is still focused. it is possible
            // it is not focused if the user cancelled the edit by clicking on another
            // cell outside of this one
            if (this.beans.focusController.isCellFocused(this.cellPosition)) {
                this.focusCell(true);
            }
        }
    };
    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    CellComp.prototype.setInlineEditingClass = function () {
        if (!this.isAlive()) {
            return;
        }
        // ag-cell-inline-editing - appears when user is inline editing
        // ag-cell-not-inline-editing - appears when user is no inline editing
        // ag-cell-popup-editing - appears when user is editing cell in popup (appears on the cell, not on the popup)
        // note: one of {ag-cell-inline-editing, ag-cell-not-inline-editing} is always present, they toggle.
        //       however {ag-cell-popup-editing} shows when popup, so you have both {ag-cell-popup-editing}
        //       and {ag-cell-not-inline-editing} showing at the same time.
        var editingInline = this.editingCell && !this.cellEditorInPopup;
        var popupEditorShowing = this.editingCell && this.cellEditorInPopup;
        this.addOrRemoveCssClass(CSS_INLINE_EDITING, editingInline);
        this.addOrRemoveCssClass(CSS_NOT_INLINE_EDITING, !editingInline);
        this.addOrRemoveCssClass(CSS_POPUP_EDITING, popupEditorShowing);
        dom_1.addOrRemoveCssClass(this.getGui().parentNode, "ag-row-inline-editing", editingInline);
        dom_1.addOrRemoveCssClass(this.getGui().parentNode, "ag-row-not-inline-editing", !editingInline);
    };
    CellComp.prototype.createCellEditorParams = function (keyPress, charPress, cellStartedEdit) {
        return {
            value: this.getValue(),
            keyPress: keyPress,
            charPress: charPress,
            column: this.column,
            colDef: this.column.getColDef(),
            rowIndex: this.cellPosition.rowIndex,
            node: this.rowNode,
            data: this.rowNode.data,
            api: this.beans.gridOptionsWrapper.getApi(),
            cellStartedEdit: cellStartedEdit,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            $scope: this.scope,
            onKeyDown: this.onKeyDown.bind(this),
            stopEditing: this.stopEditingAndFocus.bind(this),
            eGridCell: this.getGui(),
            parseValue: this.parseValue.bind(this),
            formatValue: this.formatValue.bind(this)
        };
    };
    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    CellComp.prototype.stopEditingAndFocus = function (suppressNavigateAfterEdit) {
        if (suppressNavigateAfterEdit === void 0) { suppressNavigateAfterEdit = false; }
        this.stopRowOrCellEdit();
        this.focusCell(true);
        if (!suppressNavigateAfterEdit) {
            this.navigateAfterEdit();
        }
    };
    CellComp.prototype.parseValue = function (newValue) {
        var colDef = this.getComponentHolder();
        var params = {
            node: this.rowNode,
            data: this.rowNode.data,
            oldValue: this.value,
            newValue: newValue,
            colDef: colDef,
            column: this.column,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        };
        var valueParser = colDef.valueParser;
        return generic_1.exists(valueParser) ? this.beans.expressionService.evaluate(valueParser, params) : newValue;
    };
    CellComp.prototype.focusCell = function (forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        this.beans.focusController.setFocusedCell(this.cellPosition.rowIndex, this.column, this.rowNode.rowPinned, forceBrowserFocus);
    };
    CellComp.prototype.setFocusInOnEditor = function () {
        if (this.editingCell) {
            if (this.cellEditor && this.cellEditor.focusIn) {
                // if the editor is present, then we just focus it
                this.cellEditor.focusIn();
            }
            else {
                // if the editor is not present, it means async cell editor (eg React fibre)
                // and we are trying to set focus before the cell editor is present, so we
                // focus the cell instead
                this.focusCell(true);
            }
        }
    };
    CellComp.prototype.isEditing = function () {
        return this.editingCell;
    };
    CellComp.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        switch (key) {
            case keyCode_1.KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case keyCode_1.KeyCode.F2:
                this.onF2KeyDown();
                break;
            case keyCode_1.KeyCode.ESCAPE:
                this.onEscapeKeyDown();
                break;
            case keyCode_1.KeyCode.TAB:
                this.onTabKeyDown(event);
                break;
            case keyCode_1.KeyCode.BACKSPACE:
            case keyCode_1.KeyCode.DELETE:
                this.onBackspaceOrDeleteKeyPressed(key);
                break;
            case keyCode_1.KeyCode.DOWN:
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.RIGHT:
            case keyCode_1.KeyCode.LEFT:
                this.onNavigationKeyPressed(event, key);
                break;
        }
    };
    CellComp.prototype.setFocusOutOnEditor = function () {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusOut) {
            this.cellEditor.focusOut();
        }
    };
    CellComp.prototype.onNavigationKeyPressed = function (event, key) {
        if (this.editingCell) {
            return;
        }
        if (event.shiftKey && this.rangeSelectionEnabled) {
            this.onShiftRangeSelect(key);
        }
        else {
            this.beans.rowRenderer.navigateToNextCell(event, key, this.cellPosition, true);
        }
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    };
    CellComp.prototype.onShiftRangeSelect = function (key) {
        if (!this.beans.rangeController) {
            return;
        }
        var endCell = this.beans.rangeController.extendLatestRangeInDirection(key);
        if (endCell) {
            this.beans.rowRenderer.ensureCellVisible(endCell);
        }
    };
    CellComp.prototype.onTabKeyDown = function (event) {
        this.beans.rowRenderer.onTabKeyDown(this, event);
    };
    CellComp.prototype.onBackspaceOrDeleteKeyPressed = function (key) {
        if (!this.editingCell) {
            this.startRowOrCellEdit(key);
        }
    };
    CellComp.prototype.onEnterKeyDown = function (e) {
        if (this.editingCell || this.rowComp.isEditing()) {
            this.stopEditingAndFocus();
        }
        else {
            if (this.beans.gridOptionsWrapper.isEnterMovesDown()) {
                this.beans.rowRenderer.navigateToNextCell(null, keyCode_1.KeyCode.DOWN, this.cellPosition, false);
            }
            else {
                this.startRowOrCellEdit(keyCode_1.KeyCode.ENTER);
                if (this.editingCell) {
                    // if we started editing, then we need to prevent default, otherwise the Enter action can get
                    // applied to the cell editor. this happened, for example, with largeTextCellEditor where not
                    // preventing default results in a 'new line' character getting inserted in the text area
                    // when the editing was started
                    e.preventDefault();
                }
            }
        }
    };
    CellComp.prototype.navigateAfterEdit = function () {
        var fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (fullRowEdit) {
            return;
        }
        var enterMovesDownAfterEdit = this.beans.gridOptionsWrapper.isEnterMovesDownAfterEdit();
        if (enterMovesDownAfterEdit) {
            this.beans.rowRenderer.navigateToNextCell(null, keyCode_1.KeyCode.DOWN, this.cellPosition, false);
        }
    };
    CellComp.prototype.onF2KeyDown = function () {
        if (!this.editingCell) {
            this.startRowOrCellEdit(keyCode_1.KeyCode.F2);
        }
    };
    CellComp.prototype.onEscapeKeyDown = function () {
        if (this.editingCell) {
            this.stopRowOrCellEdit(true);
            this.focusCell(true);
        }
    };
    CellComp.prototype.onKeyPress = function (event) {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        var eventTarget = event_1.getTarget(event);
        var eventOnChildComponent = eventTarget !== this.getGui();
        if (eventOnChildComponent || this.editingCell) {
            return;
        }
        var pressedChar = String.fromCharCode(event.charCode);
        if (pressedChar === ' ') {
            this.onSpaceKeyPressed(event);
        }
        else if (keyboard_1.isEventFromPrintableCharacter(event)) {
            this.startRowOrCellEdit(null, pressedChar);
            // if we don't prevent default, then the keypress also gets applied to the text field
            // (at least when doing the default editor), but we need to allow the editor to decide
            // what it wants to do. we only do this IF editing was started - otherwise it messes
            // up when the use is not doing editing, but using rendering with text fields in cellRenderer
            // (as it would block the the user from typing into text fields).
            event.preventDefault();
        }
    };
    CellComp.prototype.onSpaceKeyPressed = function (event) {
        var gridOptionsWrapper = this.beans.gridOptionsWrapper;
        if (!this.editingCell && gridOptionsWrapper.isRowSelection()) {
            var newSelection = !this.rowNode.isSelected();
            if (newSelection || !gridOptionsWrapper.isSuppressRowDeselection()) {
                this.rowNode.setSelected(newSelection);
            }
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    };
    CellComp.prototype.onMouseDown = function (mouseEvent) {
        var ctrlKey = mouseEvent.ctrlKey, metaKey = mouseEvent.metaKey, shiftKey = mouseEvent.shiftKey;
        var target = mouseEvent.target;
        var _a = this.beans, eventService = _a.eventService, rangeController = _a.rangeController;
        // do not change the range for right-clicks inside an existing range
        if (this.isRightClickInExistingRange(mouseEvent)) {
            return;
        }
        if (!shiftKey || (rangeController && !rangeController.getCellRanges().length)) {
            // We only need to pass true to focusCell when the browser is IE/Edge and we are trying
            // to focus the cell itself. This should never be true if the mousedown was triggered
            // due to a click on a cell editor for example.
            var forceBrowserFocus = (browser_1.isBrowserIE() || browser_1.isBrowserEdge()) && !this.editingCell;
            this.focusCell(forceBrowserFocus);
        }
        else {
            // if a range is being changed, we need to make sure the focused cell does not change.
            mouseEvent.preventDefault();
        }
        // if we are clicking on a checkbox, we need to make sure the cell wrapping that checkbox
        // is focused but we don't want to change the range selection, so return here.
        if (this.containsWidget(target)) {
            return;
        }
        if (rangeController) {
            var thisCell = this.cellPosition;
            if (shiftKey) {
                rangeController.extendLatestRangeToCell(thisCell);
            }
            else {
                var ctrlKeyPressed = ctrlKey || metaKey;
                rangeController.setRangeToCell(thisCell, ctrlKeyPressed);
            }
        }
        eventService.dispatchEvent(this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_DOWN));
    };
    CellComp.prototype.isRightClickInExistingRange = function (mouseEvent) {
        var rangeController = this.beans.rangeController;
        if (rangeController) {
            var cellInRange = rangeController.isCellInAnyRange(this.getCellPosition());
            if (cellInRange && mouseEvent.button === 2) {
                return true;
            }
        }
        return false;
    };
    CellComp.prototype.containsWidget = function (target) {
        return dom_1.isElementChildOfClass(target, 'ag-selection-checkbox', 3);
    };
    // returns true if on iPad and this is second 'click' event in 200ms
    CellComp.prototype.isDoubleClickOnIPad = function () {
        if (!browser_1.isIOSUserAgent() || event_1.isEventSupported('dblclick')) {
            return false;
        }
        var nowMillis = new Date().getTime();
        var res = nowMillis - this.lastIPadMouseClickEvent < 200;
        this.lastIPadMouseClickEvent = nowMillis;
        return res;
    };
    CellComp.prototype.onCellClicked = function (mouseEvent) {
        // iPad doesn't have double click - so we need to mimic it to enable editing for iPad.
        if (this.isDoubleClickOnIPad()) {
            this.onCellDoubleClicked(mouseEvent);
            mouseEvent.preventDefault(); // if we don't do this, then iPad zooms in
            return;
        }
        var _a = this.beans, eventService = _a.eventService, gridOptionsWrapper = _a.gridOptionsWrapper;
        var cellClickedEvent = this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_CLICKED);
        eventService.dispatchEvent(cellClickedEvent);
        var colDef = this.getComponentHolder();
        if (colDef.onCellClicked) {
            // to make callback async, do in a timeout
            window.setTimeout(function () { return colDef.onCellClicked(cellClickedEvent); }, 0);
        }
        var editOnSingleClick = (gridOptionsWrapper.isSingleClickEdit() || colDef.singleClickEdit)
            && !gridOptionsWrapper.isSuppressClickEdit();
        if (editOnSingleClick) {
            this.startRowOrCellEdit();
        }
    };
    CellComp.prototype.createGridCellVo = function () {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex,
            rowPinned: this.rowNode.rowPinned,
            column: this.column
        };
    };
    CellComp.prototype.getCellPosition = function () {
        return this.cellPosition;
    };
    CellComp.prototype.getParentRow = function () {
        return this.eParentRow;
    };
    CellComp.prototype.setParentRow = function (eParentRow) {
        this.eParentRow = eParentRow;
    };
    CellComp.prototype.getColumn = function () {
        return this.column;
    };
    CellComp.prototype.getComponentHolder = function () {
        return this.column.getColDef();
    };
    CellComp.prototype.detach = function () {
        this.eParentRow.removeChild(this.getGui());
    };
    // if the row is also getting destroyed, then we don't need to remove from dom,
    // as the row will also get removed, so no need to take out the cells from the row
    // if the row is going (removing is an expensive operation, so only need to remove
    // the top part)
    //
    // note - this is NOT called by context, as we don't wire / unwire the CellComp for performance reasons.
    CellComp.prototype.destroy = function () {
        if (this.createCellRendererFunc) {
            this.beans.taskQueue.cancelTask(this.createCellRendererFunc);
        }
        this.stopEditing();
        this.cellRenderer = this.beans.context.destroyBean(this.cellRenderer);
        this.beans.context.destroyBean(this.selectionHandle);
        _super.prototype.destroy.call(this);
    };
    CellComp.prototype.onLeftChanged = function () {
        var left = this.modifyLeftForPrintLayout(this.getCellLeft());
        this.getGui().style.left = left + 'px';
        this.refreshAriaIndex();
    };
    CellComp.prototype.modifyLeftForPrintLayout = function (leftPosition) {
        if (!this.printLayout || this.column.getPinned() === constants_1.Constants.PINNED_LEFT) {
            return leftPosition;
        }
        if (this.column.getPinned() === constants_1.Constants.PINNED_RIGHT) {
            var leftWidth_1 = this.beans.columnController.getPinnedLeftContainerWidth();
            var bodyWidth = this.beans.columnController.getBodyContainerWidth();
            return leftWidth_1 + bodyWidth + leftPosition;
        }
        // is in body
        var leftWidth = this.beans.columnController.getPinnedLeftContainerWidth();
        return leftWidth + leftPosition;
    };
    CellComp.prototype.onWidthChanged = function () {
        var width = this.getCellWidth();
        this.getGui().style.width = width + 'px';
    };
    CellComp.prototype.getRangeBorders = function () {
        var _this = this;
        var isRtl = this.beans.gridOptionsWrapper.isEnableRtl();
        var top = false;
        var right = false;
        var bottom = false;
        var left = false;
        var thisCol = this.cellPosition.column;
        var _a = this.beans, rangeController = _a.rangeController, columnController = _a.columnController;
        var leftCol;
        var rightCol;
        if (isRtl) {
            leftCol = columnController.getDisplayedColAfter(thisCol);
            rightCol = columnController.getDisplayedColBefore(thisCol);
        }
        else {
            leftCol = columnController.getDisplayedColBefore(thisCol);
            rightCol = columnController.getDisplayedColAfter(thisCol);
        }
        var ranges = rangeController.getCellRanges().filter(function (range) { return rangeController.isCellInSpecificRange(_this.cellPosition, range); });
        // this means we are the first column in the grid
        if (!leftCol) {
            left = true;
        }
        // this means we are the last column in the grid
        if (!rightCol) {
            right = true;
        }
        for (var i = 0; i < ranges.length; i++) {
            if (top && right && bottom && left) {
                break;
            }
            var range = ranges[i];
            var startRow = rangeController.getRangeStartRow(range);
            var endRow = rangeController.getRangeEndRow(range);
            if (!top && this.beans.rowPositionUtils.sameRow(startRow, this.cellPosition)) {
                top = true;
            }
            if (!bottom && this.beans.rowPositionUtils.sameRow(endRow, this.cellPosition)) {
                bottom = true;
            }
            if (!left && range.columns.indexOf(leftCol) < 0) {
                left = true;
            }
            if (!right && range.columns.indexOf(rightCol) < 0) {
                right = true;
            }
        }
        return { top: top, right: right, bottom: bottom, left: left };
    };
    CellComp.prototype.getInitialRangeClasses = function () {
        var classes = [];
        if (!this.rangeSelectionEnabled || !this.rangeCount) {
            return classes;
        }
        classes.push(CSS_RANGE_SELECTED);
        if (this.hasChartRange) {
            classes.push(CSS_RANGE_CHART);
        }
        var count = Math.min(this.rangeCount, 4);
        classes.push(CSS_RANGE_SELECTED + "-" + count);
        if (this.isSingleCell()) {
            classes.push(CSS_RANGE_SINGLE_CELL);
        }
        if (this.rangeCount > 0) {
            var borders = this.getRangeBorders();
            if (borders.top) {
                classes.push(CSS_RANGE_TOP);
            }
            if (borders.right) {
                classes.push(CSS_RANGE_RIGHT);
            }
            if (borders.bottom) {
                classes.push(CSS_RANGE_BOTTOM);
            }
            if (borders.left) {
                classes.push(CSS_RANGE_LEFT);
            }
        }
        if (!!this.selectionHandle) {
            classes.push(CSS_RANGE_HANDLE);
        }
        return classes;
    };
    CellComp.prototype.onRowIndexChanged = function () {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createGridCellVo();
        // when the index of the row changes, ie means the cell may have lost or gained focus
        this.onCellFocused();
        // check range selection
        this.onRangeSelectionChanged();
    };
    CellComp.prototype.onRangeSelectionChanged = function () {
        var rangeController = this.beans.rangeController;
        if (!rangeController) {
            return;
        }
        var _a = this, cellPosition = _a.cellPosition, rangeCount = _a.rangeCount;
        var newRangeCount = rangeController.getCellRangeCount(cellPosition);
        var element = this.getGui();
        if (rangeCount !== newRangeCount) {
            this.addOrRemoveCssClass(CSS_RANGE_SELECTED, newRangeCount !== 0);
            this.addOrRemoveCssClass(CSS_RANGE_SELECTED + "-1", newRangeCount === 1);
            this.addOrRemoveCssClass(CSS_RANGE_SELECTED + "-2", newRangeCount === 2);
            this.addOrRemoveCssClass(CSS_RANGE_SELECTED + "-3", newRangeCount === 3);
            this.addOrRemoveCssClass(CSS_RANGE_SELECTED + "-4", newRangeCount >= 4);
            this.rangeCount = newRangeCount;
        }
        aria_1.setAriaSelected(element, this.rangeCount > 0);
        var hasChartRange = this.getHasChartRange();
        if (hasChartRange !== this.hasChartRange) {
            this.hasChartRange = hasChartRange;
            this.addOrRemoveCssClass(CSS_RANGE_CHART, this.hasChartRange);
        }
        this.updateRangeBorders();
        this.addOrRemoveCssClass(CSS_RANGE_SINGLE_CELL, this.isSingleCell());
        this.refreshHandle();
    };
    CellComp.prototype.getHasChartRange = function () {
        var rangeController = this.beans.rangeController;
        if (!this.rangeCount || !rangeController) {
            return false;
        }
        var cellRanges = rangeController.getCellRanges();
        return cellRanges.length > 0 && cellRanges.every(function (range) { return array_1.includes([iRangeController_1.CellRangeType.DIMENSION, iRangeController_1.CellRangeType.VALUE], range.type); });
    };
    CellComp.prototype.shouldHaveSelectionHandle = function () {
        var _a = this.beans, gridOptionsWrapper = _a.gridOptionsWrapper, rangeController = _a.rangeController;
        var cellRanges = rangeController.getCellRanges();
        var rangesLen = cellRanges.length;
        if (this.rangeCount < 1 || rangesLen < 1) {
            return false;
        }
        var cellRange = array_1.last(cellRanges);
        var cellPosition = this.getCellPosition();
        var fillHandleIsAvailable = rangesLen === 1 &&
            (gridOptionsWrapper.isEnableFillHandle() || gridOptionsWrapper.isEnableRangeHandle()) &&
            !this.editingCell;
        if (this.hasChartRange) {
            var hasCategoryRange = cellRanges[0].type === iRangeController_1.CellRangeType.DIMENSION;
            var isCategoryCell = hasCategoryRange && rangeController.isCellInSpecificRange(cellPosition, cellRanges[0]);
            this.addOrRemoveCssClass(CSS_RANGE_CHART_CATEGORY, isCategoryCell);
            fillHandleIsAvailable = cellRange.type === iRangeController_1.CellRangeType.VALUE;
        }
        return fillHandleIsAvailable &&
            cellRange.endRow != null &&
            rangeController.isContiguousRange(cellRange) &&
            rangeController.isBottomRightCell(cellRange, cellPosition);
    };
    CellComp.prototype.addSelectionHandle = function () {
        var _a = this.beans, gridOptionsWrapper = _a.gridOptionsWrapper, context = _a.context, rangeController = _a.rangeController;
        var cellRangeType = array_1.last(rangeController.getCellRanges()).type;
        var selectionHandleFill = gridOptionsWrapper.isEnableFillHandle() && generic_1.missing(cellRangeType);
        var type = selectionHandleFill ? iRangeController_1.SelectionHandleType.FILL : iRangeController_1.SelectionHandleType.RANGE;
        if (this.selectionHandle && this.selectionHandle.getType() !== type) {
            this.selectionHandle = this.beans.context.destroyBean(this.selectionHandle);
        }
        if (!this.selectionHandle) {
            this.selectionHandle = this.beans.selectionHandleFactory.createSelectionHandle(type);
        }
        this.selectionHandle.refresh(this);
    };
    CellComp.prototype.updateRangeBordersIfRangeCount = function () {
        // we only need to update range borders if we are in a range
        if (this.rangeCount > 0) {
            this.updateRangeBorders();
            this.refreshHandle();
        }
    };
    CellComp.prototype.refreshHandle = function () {
        if (!this.beans.rangeController) {
            return;
        }
        var shouldHaveSelectionHandle = this.shouldHaveSelectionHandle();
        if (this.selectionHandle && !shouldHaveSelectionHandle) {
            this.selectionHandle = this.beans.context.destroyBean(this.selectionHandle);
        }
        if (shouldHaveSelectionHandle) {
            this.addSelectionHandle();
        }
        this.addOrRemoveCssClass(CSS_RANGE_HANDLE, !!this.selectionHandle);
    };
    CellComp.prototype.updateRangeBorders = function () {
        var rangeBorders = this.getRangeBorders();
        var isSingleCell = this.isSingleCell();
        var isTop = !isSingleCell && rangeBorders.top;
        var isRight = !isSingleCell && rangeBorders.right;
        var isBottom = !isSingleCell && rangeBorders.bottom;
        var isLeft = !isSingleCell && rangeBorders.left;
        this.addOrRemoveCssClass(CSS_RANGE_TOP, isTop);
        this.addOrRemoveCssClass(CSS_RANGE_RIGHT, isRight);
        this.addOrRemoveCssClass(CSS_RANGE_BOTTOM, isBottom);
        this.addOrRemoveCssClass(CSS_RANGE_LEFT, isLeft);
    };
    CellComp.prototype.onFirstRightPinnedChanged = function () {
        var firstRightPinned = this.column.isFirstRightPinned();
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.addOrRemoveCssClass(CSS_FIRST_RIGHT_PINNED, firstRightPinned);
        }
    };
    CellComp.prototype.onLastLeftPinnedChanged = function () {
        var lastLeftPinned = this.column.isLastLeftPinned();
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.addOrRemoveCssClass(CSS_LAST_LEFT_PINNED, lastLeftPinned);
        }
    };
    CellComp.prototype.populateTemplate = function () {
        if (this.usingWrapper) {
            this.eCellValue = this.getRefElement('eCellValue');
            this.eCellWrapper = this.getRefElement('eCellWrapper');
            if (this.includeRowDraggingComponent) {
                this.addRowDragging();
            }
            if (this.includeDndSourceComponent) {
                this.addDndSource();
            }
            if (this.includeSelectionComponent) {
                this.addSelectionCheckbox();
            }
        }
        else {
            this.eCellValue = this.getGui();
        }
    };
    CellComp.prototype.getFrameworkOverrides = function () {
        return this.beans.frameworkOverrides;
    };
    CellComp.prototype.addRowDragging = function () {
        var pagination = this.beans.gridOptionsWrapper.isPagination();
        var rowDragManaged = this.beans.gridOptionsWrapper.isRowDragManaged();
        var clientSideRowModelActive = this.beans.gridOptionsWrapper.isRowModelDefault();
        if (rowDragManaged) {
            // row dragging only available in default row model
            if (!clientSideRowModelActive) {
                function_1.doOnce(function () { return console.warn('ag-Grid: managed row dragging is only allowed in the Client Side Row Model'); }, 'CellComp.addRowDragging');
                return;
            }
            if (pagination) {
                function_1.doOnce(function () { return console.warn('ag-Grid: managed row dragging is not possible when doing pagination'); }, 'CellComp.addRowDragging');
                return;
            }
        }
        var rowDraggingComp = new rowDragComp_1.RowDragComp(this.rowNode, this.column, this.getValueToUse(), this.beans);
        this.createManagedBean(rowDraggingComp, this.beans.context);
        // put the checkbox in before the value
        this.eCellWrapper.insertBefore(rowDraggingComp.getGui(), this.eCellValue);
    };
    CellComp.prototype.addDndSource = function () {
        var dndSourceComp = new dndSourceComp_1.DndSourceComp(this.rowNode, this.column, this.getValueToUse(), this.beans, this.getGui());
        this.createManagedBean(dndSourceComp, this.beans.context);
        // put the checkbox in before the value
        this.eCellWrapper.insertBefore(dndSourceComp.getGui(), this.eCellValue);
    };
    CellComp.prototype.addSelectionCheckbox = function () {
        var _this = this;
        var cbSelectionComponent = new checkboxSelectionComponent_1.CheckboxSelectionComponent();
        this.beans.context.createBean(cbSelectionComponent);
        var visibleFunc = this.getComponentHolder().checkboxSelection;
        visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;
        cbSelectionComponent.init({ rowNode: this.rowNode, column: this.column, visibleFunc: visibleFunc });
        this.addDestroyFunc(function () { return _this.beans.context.destroyBean(cbSelectionComponent); });
        // put the checkbox in before the value
        this.eCellWrapper.insertBefore(cbSelectionComponent.getGui(), this.eCellValue);
    };
    CellComp.prototype.addDomData = function () {
        var _this = this;
        var element = this.getGui();
        this.beans.gridOptionsWrapper.setDomData(element, CellComp.DOM_DATA_KEY_CELL_COMP, this);
        this.addDestroyFunc(function () { return _this.beans.gridOptionsWrapper.setDomData(element, CellComp.DOM_DATA_KEY_CELL_COMP, null); });
    };
    CellComp.prototype.isSingleCell = function () {
        var rangeController = this.beans.rangeController;
        return this.rangeCount === 1 && rangeController && !rangeController.isMoreThanOneCell();
    };
    CellComp.prototype.onCellFocused = function (event) {
        var cellFocused = this.beans.focusController.isCellFocused(this.cellPosition);
        // see if we need to change the classes on this cell
        if (cellFocused !== this.cellFocused) {
            // if we are not doing cell selection, then the focus class does not change
            var doingFocusCss = !this.beans.gridOptionsWrapper.isSuppressCellSelection();
            if (doingFocusCss) {
                this.addOrRemoveCssClass(CSS_CELL_FOCUS, cellFocused);
            }
            this.cellFocused = cellFocused;
        }
        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (cellFocused && event && event.forceBrowserFocus) {
            var focusEl = this.getFocusableElement();
            focusEl.focus();
            // Fix for AG-3465 "IE11 - After editing cell's content, selection doesn't go one cell below on enter"
            // IE can fail to focus the cell after the first call to focus(), and needs a second call
            if (!document.activeElement || document.activeElement === document.body) {
                focusEl.focus();
            }
        }
        // if another cell was focused, and we are editing, then stop editing
        var fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (!cellFocused && !fullRowEdit && this.editingCell) {
            this.stopRowOrCellEdit();
        }
    };
    // pass in 'true' to cancel the editing.
    CellComp.prototype.stopRowOrCellEdit = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowComp.stopRowEditing(cancel);
        }
        else {
            this.stopEditing(cancel);
        }
    };
    CellComp.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (!this.editingCell) {
            return;
        }
        // if no cell editor, this means due to async, that the cell editor never got initialised,
        // so we just carry on regardless as if the editing was never started.
        if (!this.cellEditor) {
            this.editingCell = false;
            return;
        }
        var oldValue = this.getValue();
        var newValueExists = false;
        var newValue;
        if (!cancel) {
            // also have another option here to cancel after editing, so for example user could have a popup editor and
            // it is closed by user clicking outside the editor. then the editor will close automatically (with false
            // passed above) and we need to see if the editor wants to accept the new value.
            var userWantsToCancel = this.cellEditor.isCancelAfterEnd && this.cellEditor.isCancelAfterEnd();
            if (!userWantsToCancel) {
                newValue = this.cellEditor.getValue();
                newValueExists = true;
            }
        }
        // it is important we set this after setValue() above, as otherwise the cell will flash
        // when editing stops. the 'refresh' method checks editing, and doesn't refresh editing cells.
        // thus it will skip the refresh on this cell until the end of this method where we call
        // refresh directly and we suppress the flash.
        this.editingCell = false;
        // important to clear this out - as parts of the code will check for
        // this to see if an async cellEditor has yet to be created
        this.cellEditor = this.beans.context.destroyBean(this.cellEditor);
        this.cellEditor = null;
        if (this.cellEditorInPopup && this.hideEditorPopup) {
            this.hideEditorPopup();
            this.hideEditorPopup = null;
        }
        else {
            dom_1.clearElement(this.getGui());
            // put the cell back the way it was before editing
            if (this.usingWrapper) {
                // if wrapper, then put the wrapper back
                this.getGui().appendChild(this.eCellWrapper);
            }
            else if (this.cellRenderer) {
                // if cellRenderer, then put the gui back in. if the renderer has
                // a refresh, it will be called. however if it doesn't, then later
                // the renderer will be destroyed and a new one will be created.
                // we know it's a dom element (not a string) because we converted
                // it after the gui was attached if it was a string.
                var eCell = this.cellRendererGui;
                // can be null if cell was previously null / contained empty string,
                // this will result in new value not being rendered.
                if (eCell) {
                    this.getGui().appendChild(eCell);
                }
            }
        }
        this.setInlineEditingClass();
        this.refreshHandle();
        if (newValueExists && newValue !== oldValue) {
            // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
            // getting triggered, which results in all cells getting refreshed. we do not want this refresh
            // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
            // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
            this.suppressRefreshCell = true;
            this.rowNode.setDataValue(this.column, newValue);
            this.suppressRefreshCell = false;
        }
        // we suppress the flash, as it is not correct to flash the cell the user has finished editing,
        // the user doesn't need to flash as they were the one who did the edit, the flash is pointless
        // (as the flash is meant to draw the user to a change that they didn't manually do themselves).
        this.refreshCell({ forceRefresh: true, suppressFlash: true });
        var editingStoppedEvent = __assign(__assign({}, this.createEvent(null, events_1.Events.EVENT_CELL_EDITING_STOPPED)), { oldValue: oldValue,
            newValue: newValue });
        this.beans.eventService.dispatchEvent(editingStoppedEvent);
    };
    CellComp.DOM_DATA_KEY_CELL_COMP = 'cellComp';
    CellComp.CELL_RENDERER_TYPE_NORMAL = 'cellRenderer';
    CellComp.CELL_RENDERER_TYPE_PINNED = 'pinnedRowCellRenderer';
    return CellComp;
}(component_1.Component));
exports.CellComp = CellComp;

//# sourceMappingURL=cellComp.js.map
