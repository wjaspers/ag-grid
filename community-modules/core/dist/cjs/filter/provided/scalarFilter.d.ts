// Type definitions for @ag-grid-community/core v24.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { SimpleFilter, ISimpleFilterParams, ISimpleFilterModel } from "./simpleFilter";
import { IDoesFilterPassParams } from "../../interfaces/iFilter";
/** @deprecated in v21*/
export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}
export interface IScalarFilterParams extends ISimpleFilterParams {
    inRangeInclusive?: boolean;
    includeBlanksInEquals?: boolean;
    includeBlanksInLessThan?: boolean;
    includeBlanksInGreaterThan?: boolean;
    /** @deprecated in v21*/
    nullComparator?: NullComparator;
}
export interface Comparator<T> {
    (left: T, right: T): number;
}
export declare abstract class ScalarFilter<M extends ISimpleFilterModel, T> extends SimpleFilter<M> {
    private scalarFilterParams;
    protected abstract comparator(): Comparator<T>;
    protected abstract mapRangeFromModel(filterModel: ISimpleFilterModel): {
        from: T;
        to: T;
    };
    protected setParams(params: IScalarFilterParams): void;
    private checkDeprecatedParams;
    private nullComparator;
    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: ISimpleFilterModel): boolean;
}
