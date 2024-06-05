/* *
 *
 *  Data Grid class
 *
 *  (c) 2020-2024 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type { ColumnOptions } from './DataGridOptions';

import DataGridCell from './DataGridCell.js';
import DataGridTable from './DataGridTable.js';
import DataTable from '../../Data/DataTable.js';
import Globals from './Globals.js';
import Utils from '../../Core/Utilities.js';

const { merge } = Utils;


/* *
 *
 *  Class
 *
 * */

/**
 * Represents a column in the data grid.
 */
class DataGridColumn {

    /* *
    *
    *  Properties
    *
    * */

    /**
     * The default options of the column.
     */
    public static defaultOptions = {};


    /**
     * The viewport (table) the column belongs to.
     */
    public viewport: DataGridTable;

    /**
     * The width of the column in the viewport. The interpretation of the
     * value depends on the `columns.distribution` option:
     * - `full`: The width is a ratio of the viewport width.
     * - `fixed`: The width is a fixed number of pixels.
     */
    public width: number;

    /**
     * The cells of the column.
     */
    public cells: DataGridCell[] = [];

    /**
     * The id of the column (`name` in the Data Table).
     */
    public id: string;

    /**
     * The data of the column.
     */
    public data?: DataTable.Column;

    /**
     * The type of the column data.
     */
    public type?: DataGridColumn.Type;

    /**
     * The head element of the column.
     */
    public headElement?: HTMLElement;

    /**
     * The user options of the column.
     */
    public userOptions: ColumnOptions;

    /**
     * The options of the column.
     */
    public options: ColumnOptions;

    /**
     * The index of the column in the viewport.
     */
    public index: number;


    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs a column in the data grid.
     *
     * @param viewport The viewport (table) the column belongs to.
     * @param id The id of the column (`name` in the Data Table).
     * @param index The index of the column.
     * @param options The options of the column.
     */
    constructor(
        viewport: DataGridTable,
        id: string,
        index: number,
        options?: ColumnOptions
    ) {
        this.userOptions = merge(
            viewport.dataGrid.options.columns?.options ?? {},
            options ?? {}
        );
        this.options = merge(DataGridColumn.defaultOptions, options);

        // Set the initial width of the column.
        // TODO(DD): Get the initial width from the CSS.
        this.width = viewport.columnDistribution === 'full' ? 1 : 100;

        this.id = id;
        this.index = index;
        this.viewport = viewport;
        this.data = viewport.dataTable.getColumn(id);
    }


    /* *
    *
    *  Methods
    *
    * */

    /**
     * Registers a cell in the column.
     *
     * @param cell The cell to register.
     */
    public registerCell(cell: DataGridCell): void {
        cell.htmlElement.setAttribute('column-id', this.id);

        this.cells.push(cell);
    }

    /**
     * Returns the width of the column in pixels.
     */
    public getWidth(): number {
        const vp = this.viewport;

        return vp.columnDistribution === 'full' ?
            vp.getWithFromRatio(this.width) :
            this.width;
    }


    /**
     * Sets the column hover state.
     *
     * @param hovered Whether the column should be hovered.
     */
    public setHover(hovered: boolean): void {
        this.headElement?.classList[hovered ? 'add' : 'remove'](
            Globals.classNames.hoveredColumn
        );

        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            this.cells[i].htmlElement.classList[hovered ? 'add' : 'remove'](
                Globals.classNames.hoveredColumn
            );
        }
    }

    /* *
    *
    *  Static Methods
    *
    * */

}


/* *
 *
 *  Class Namespace
 *
 * */

namespace DataGridColumn {
    export type Type = 'number'|'date'|'string'|'boolean';
}


/* *
 *
 *  Default Export
 *
 * */

export default DataGridColumn;
