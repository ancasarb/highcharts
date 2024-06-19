/* *
 *
 *  Data Grid Rows Renderer class.
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

import DataGridTable from '../DataGridTable.js';
import DGUtils from '../Utils.js';
import Globals from '../Globals.js';
import DataGridRow from '../DataGridRow.js';

const { makeHTMLElement, getTranslateY } = DGUtils;


/* *
 *
 *  Class
 *
 * */

/**
 * Represents a virtualized rows renderer for the data grid.
 */
class RowsVirtualizer {

    /* *
    *
    *  Properties
    *
    * */

    /**
     * The default height of a row.
     */
    public defaultRowHeight: number;

    /**
     * The index of the first visible row.
     */
    public rowCursor: number = 0;

    /**
     * The viewport (table) of the data grid.
     */
    public viewport: DataGridTable;

    /**
     * Size of the row buffer - how many rows should be rendered outside of the
     * viewport from the top and the bottom.
     */
    private buffer: number;

    // Uncomment when needed.
    // /**
    //  * Flag indicating if the last row is visible in the viewport.
    //  */
    // private lastRowVisible: boolean = false;


    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs an instance of the rows virtualizer.
     *
     * @param viewport
     * The viewport of the data grid to render rows in.
     */
    constructor(viewport: DataGridTable) {
        this.viewport = viewport;
        this.defaultRowHeight = this.getDefaultRowHeight();
        this.buffer =
            viewport.dataGrid.options.settings?.rowBufferSize as number;
    }


    /* *
    *
    *  Functions
    *
    * */

    /**
     * Renders the rows in the viewport for the first time.
     */
    public initialRender(): void {
        // Initial reflow to set the viewport height
        this.viewport.reflow();

        // Load & render rows
        this.renderRows(this.rowCursor);
        this.adjustRowHeights();
    }

    public scroll(): void {
        const target = this.viewport.tbodyElement;
        const { defaultRowHeight: rowHeight } = this;

        /* Uncomment when needed.
        const rows = this.viewport.rows;
        this.lastRowVisible =
            target.clientHeight + target.scrollTop >=
            getTranslateY(rows[rows.length - 1].htmlElement);
        */

        const lastScrollTop = target.scrollTop;

        // Do vertical virtual scrolling
        const rowCursor = Math.floor(target.scrollTop / rowHeight);
        if (this.rowCursor !== rowCursor) {
            this.renderRows(rowCursor);
        }
        this.rowCursor = rowCursor;
        // -----------------------------

        this.adjustRowHeights();

        if (lastScrollTop > target.scrollTop) {
            target.scrollTop = lastScrollTop;
        }
    }

    /**
     * Renders rows in the specified range. Removes rows that are out of the
     * range except the last row.
     *
     * @param rowCursor
     * The index of the first visible row.
     */
    private renderRows(rowCursor: number): void {
        const { viewport: vp, buffer } = this;
        const rowsPerPage = Math.ceil(
            vp.tbodyElement.offsetHeight / this.defaultRowHeight
        );

        const rows = vp.rows;

        if (!rows.length) {
            const last = new DataGridRow(vp, vp.dataTable.getRowCount() - 1);
            last.render();
            rows.push(last);
            vp.tbodyElement.appendChild(last.htmlElement);
        }

        const from = Math.min(
            Math.max(rowCursor - buffer, 0),
            vp.dataTable.getRowCount() - rowsPerPage
        );
        const to = Math.min(
            rowCursor + rowsPerPage + buffer,
            rows[rows.length - 1].index - 1
        );

        const alwaysLastRow = rows.pop();

        for (let i = 0, iEnd = rows.length; i < iEnd; ++i) {
            rows[i].destroy();
        }
        rows.length = 0;

        for (let i = from; i <= to; ++i) {
            const newRow = new DataGridRow(vp, i);
            newRow.render();
            vp.tbodyElement.insertBefore(
                newRow.htmlElement,
                vp.tbodyElement.lastChild
            );

            rows.push(newRow);
        }

        if (alwaysLastRow) {
            rows.push(alwaysLastRow);
        }
    }

    /**
     * Adjusts the heights of the rows based on the current scroll position.
     * It handles the possibility of the rows having different heights than
     * the default height.
     */
    public adjustRowHeights(): void {
        const { rowCursor: cursor, defaultRowHeight: defaultH } = this;
        const { rows, tbodyElement } = this.viewport;
        const rowsLn = rows.length;

        let translateBuffer = rows[0].getDefaultTopOffset();

        for (let i = 0; i < rowsLn; ++i) {
            const row = rows[i];

            // Reset row height and cell transforms
            row.htmlElement.style.height = '';
            if (row.cells[0].htmlElement.style.transform) {
                for (let j = 0, jEnd = row.cells.length; j < jEnd; ++j) {
                    const cell = row.cells[j];
                    cell.htmlElement.style.transform = '';
                }
            }

            // Rows above the first visible row
            if (row.index < cursor) {
                row.htmlElement.style.height = defaultH + 'px';
                continue;
            }

            const cellHeight = row.cells[0].htmlElement.offsetHeight;
            row.htmlElement.style.height = cellHeight + 'px';

            // Rows below the first visible row
            if (row.index > cursor) {
                continue;
            }

            // First visible row
            if (row.htmlElement.offsetHeight > defaultH) {
                const newHeight = Math.floor(
                    cellHeight - (cellHeight - defaultH) * (
                        tbodyElement.scrollTop / defaultH - cursor
                    )
                );

                row.htmlElement.style.height = newHeight + 'px';

                for (let j = 0, jEnd = row.cells.length; j < jEnd; ++j) {
                    const cell = row.cells[j];
                    cell.htmlElement.style.transform = `translateY(${
                        newHeight - cellHeight
                    }px)`;
                }
            }
        }

        for (let i = 1, iEnd = rowsLn - 1; i < iEnd; ++i) {
            translateBuffer += rows[i - 1].htmlElement.offsetHeight;
            rows[i].htmlElement.style.transform =
                `translateY(${translateBuffer}px)`;
        }

        // Set the proper offset for the last row
        const lastRow = rows[rowsLn - 1];
        const preLastRow = rows[rowsLn - 2];
        if (preLastRow && preLastRow.index === lastRow.index - 1) {
            lastRow.htmlElement.style.transform = `translateY(${
                preLastRow.htmlElement.offsetHeight +
                getTranslateY(preLastRow.htmlElement)
            }px)`;
        }
    }

    /**
     * Reflow the rendered rows content dimensions.
     */
    public reflowRows(): void {
        const rows = this.viewport.rows;

        if (rows.length < 1) {
            return;
        }

        for (let i = 0, iEnd = rows.length; i < iEnd; ++i) {
            rows[i].reflow();
        }

        this.adjustRowHeights();
    }

    /**
     * Returns the default height of a row. This method should be called only
     * once on initialization.
     */
    private getDefaultRowHeight(): number {
        const mockRow = makeHTMLElement('tr', {
            className: Globals.classNames.rowElement
        }, this.viewport.tbodyElement);

        const defaultRowHeight = mockRow.offsetHeight;
        mockRow.remove();

        return defaultRowHeight;
    }
}


/* *
 *
 *  Default Export
 *
 * */

export default RowsVirtualizer;
