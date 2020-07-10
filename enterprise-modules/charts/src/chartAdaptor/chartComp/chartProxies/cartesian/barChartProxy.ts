import { _, BarSeriesOptions, CartesianChartOptions, ChartType } from "@ag-grid-community/core";
import {
    CartesianChart,
    AgChart, AgCartesianChartOptions, AgBarSeriesOptions
} from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: AgCartesianChartOptions): CartesianChart {
        const {grouping, parentElement} = this.chartProxyParams;
        const isColumnChart = this.isColumnChart();

        options = options || this.chartOptions;
        options.autoSize = true;
        options.axes = [
            { // x-axis
                position: isColumnChart ? 'bottom' : 'left',
                type: grouping ? 'groupedCategory' : 'category',
                label: {
                    rotation: isColumnChart ? 335 : 0
                }
            },
            { // y-axis
                position: isColumnChart ? 'left' : 'bottom',
                type: 'number',
                label: {
                    rotation: isColumnChart ? 0 : 335
                }
            }
        ];
        options.series = [{
            ...this.getSeriesOptions(),
            // ...this.getSeriesDefaults(),
            // fills: seriesDefaults.fills || seriesDefaults.fill.colors,
            // fillOpacity: seriesDefaults.fill.opacity,
            // strokes: seriesDefaults.strokes || seriesDefaults.stroke.colors,
            // strokeOpacity: seriesDefaults.stroke.opacity,
            // strokeWidth: seriesDefaults.stroke.width
        }];

        return AgChart.create<AgCartesianChartOptions>(options, parentElement);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        this.updateAxes('category', !this.isColumnChart());

        const options: any = this.chartOptions;

        const series = options.series[0];
        series.data = this.transformData(params.data, params.category.id);
        series.xKey = params.category.id;
        series.xName = params.category.name;
        series.yKeys = params.fields.map(f => f.colId);
        series.yNames = params.fields.map(f => f.displayName);

        AgChart.update(this.chart, options, this.chartProxyParams.parentElement);

        this.updateLabelRotation(params.category.id, !this.isColumnChart());
    }

    // protected getDefaultOptions(): CartesianChartOptions<BarSeriesOptions> {
    //     const isColumnChart = this.isColumnChart();
    //     const fontOptions = this.getDefaultFontOptions();
    //     const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<BarSeriesOptions>;
    //
    //     options.xAxis.label.rotation = isColumnChart ? 335 : 0;
    //     options.yAxis.label.rotation = isColumnChart ? 0 : 335;
    //
    //     options.seriesDefaults = {
    //         ...options.seriesDefaults,
    //         tooltip: {
    //             enabled: true,
    //         },
    //         label: {
    //             ...fontOptions,
    //             enabled: false,
    //         },
    //         shadow: this.getDefaultDropShadowOptions(),
    //     };
    //
    //     return options;
    // }

    protected getDefaultOptions(): AgCartesianChartOptions {
        return this.getDefaultCartesianChartOptions();
    }

    private isColumnChart(): boolean {
        return _.includes([ChartType.GroupedColumn, ChartType.StackedColumn, ChartType.NormalizedColumn], this.chartType);
    }

    private getSeriesOptions(): AgBarSeriesOptions {
        const { chartType } = this;
        const isColumnChart = this.isColumnChart();
        const isGrouped = chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar;
        const isNormalized = chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar;

        return {
            // ...this.chartOptions.seriesDefaults,
            type: isColumnChart ? 'column' : 'bar',
            grouped: isGrouped,
            normalizedTo: isNormalized ? 100 : undefined,
        };
    }
}
