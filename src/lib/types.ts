import { ComputedRef, Ref } from "vue";

// export interface SWRServiceOptions {
//     // cache: SWRCacheService;
// }

// /**
//  * SWR Cache main interface
//  */
// export interface SWRCacheService {
//     /**
//      * Via this method SWR Service will get data
//      * from cache
//      */
//     getData: (resourceKey: string) => any;

//     /**
//      * Via this method SWR Service will set
//      * loaded data to cache
//      */
//     setData: (resourceKey: string, data: any) => void;
// }

export type SWRFetcherFn<T> = () => (T | Promise<T>);

// type ResourceKeyVariants<T> =
//     // const immutable key
//     | T
//     // getter to key
//     | (() => T)
//     // reactive ref to key
//     | Ref<T>

export type SWRResourceKey =
    // const immutable key
    | string
    // getter to key
    | (() => string | null | undefined)
    // reactive ref to key
    | Ref<string | null | undefined>


    

export interface SWRResource<T> {
    data: ComputedRef<T | null>;
    error: ComputedRef<unknown | null>;
    pending: ComputedRef<boolean>;
    // success: Readonly<Ref<boolean>>;
    mutate: () => void;
}

// const res: SWRResource<{ data: ComputedRef<boolean> }> = null;

// res.data.value?.data.value

// export enum SWRResourceState {
//     Pending,
//     Validating,
//     Success,
//     Error,
//     StaleIfError
// }

export type SWRResourceMutateFn = (key: string, fetcher: SWRFetcherFn<any>) => void;

export type SWRResourceUseFn = <T>(key: SWRResourceKey, fetcher: SWRFetcherFn<T>) => SWRResource<T>;

export interface SWRService {
    mutate: SWRResourceMutateFn;
    useResource: SWRResourceUseFn;
}
