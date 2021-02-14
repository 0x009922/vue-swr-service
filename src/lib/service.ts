import { computed, shallowReactive, watch } from "vue";
import { SWRFetcherFn, SWRResourceKey, SWRResourceMutateFn, SWRResourceUseFn, SWRService } from "./types";

interface ResourceRaw {
    data: any | null;
    error: any | null;
    pending: boolean;
}

const SWR_CONSOLE_PREFIX = '[swr-service]'

function consoleWarn(...args: any[]) {
    console.warn(SWR_CONSOLE_PREFIX, ...args);
}

function consoleLog(...args: any[]) {
    console.log(SWR_CONSOLE_PREFIX, ...args);
}

async function execFetcher<T>(fn: SWRFetcherFn<T>): Promise<T> {
    const result = await fn();
    return result;
}

export function createSWRService(): SWRService {
    const resources = shallowReactive(new Map<string, ResourceRaw>());

    const mutate: SWRResourceMutateFn = (key: string, fetcher: SWRFetcherFn<any>) => {
        // Мутация определённого ресурса. Если он уже есть и не загружается при этом,
        // то будет загружен заново. Если ещё нет, то тоже будет загружен

        const res = resources.get(key)

        if (res && res.pending) {
            consoleWarn(`Resource "${key}" already pending. Mutation ignored.`)
            return;
        }

        const nonNullRes = res || shallowReactive({
            data: null,
            error: null,
            pending: true
        })

        consoleLog(`Executing fetcher for resource: ${key}`);
        execFetcher(fetcher)
            .then((data) => nonNullRes.data =data)
            .catch((err) => nonNullRes.error = err)
            .finally(() => nonNullRes.pending = false)

        // нет res - значит, в карте пока нет такой записи. Создаю
        if (!res) {
            resources.set(key, nonNullRes);
        }
    }

    const useResource: SWRResourceUseFn = <T>(keyRaw: SWRResourceKey, fetcher: SWRFetcherFn<T>) => {
        const key = computed<null | string>(() => {
            // нормализация ключа
            if (typeof keyRaw === 'string') {
                return keyRaw;
            }
            if (typeof keyRaw === 'function') {
                return keyRaw() ?? null;
            }
            return keyRaw.value ?? null
        })

        const resource = computed<ResourceRaw | null>(() => (key.value !== null && resources.get(key.value)) || null);

        function mutateThisResource() {
            const resourceKey = key.value;
            if (!resourceKey) {
                consoleWarn('Resource key is nullish. Mutation ignored.');
                return;
            }

            mutate(resourceKey, fetcher);
        }

        // ставлю watch на изменение ключа
        // как только он сменяется и при этом не null, я смотрю на соответствующие ключу данные
        // если они есть, то ок. Если нет, то сразу и мутирую
        watch(key, (value) => {
            if (value && !resource.value?.pending) {
                mutateThisResource();
            }
        }, { immediate: true })

        const data = computed(() => resource.value?.data ?? null);
        const error = computed(() => resource.value?.error ?? null);
        const pending = computed(() => resource.value?.pending ?? false);

        return {
            data,
            error,
            pending,
            mutate: mutateThisResource
        }
    }

    return {
        mutate,
        useResource
    }
}

