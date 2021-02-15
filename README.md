# vue-swr-service

Stale-While-Revalidate data fetching for Vue 3.

Inspired by [swrv](https://github.com/Kong/swrv).

### Install

```
npm i vue-swr-service
```

### Usage

Create service in some module:

```ts
// swr/index.ts
import { createSWRService } from 'vue-swr-service';

export const {
    mutate,
    useResource
} = createSWRService();
```

Then use it in composables:

```ts
import { useResource } from '../swr'

export default {
    setup() {
        const {
            data,
            pending,
            error,
            mutate,
        } = useResource('animals', () => fetch('/api/v1/animals'));
    }
}
```

Also you can prerefetch some resource by `mutate`:

```ts
import { mutate } from '../swr'

mutate('animals-55', fetch('/api/v1/animals/55'));
```

All data is saving in-memory, so you can share resources state across all app.

## TODO

- [ ] Tests.
- [ ] Tools for data caching logic (`localStorage` or anything else, develop universal API).
- [ ] Options to define data's **Time To Live**.
- [ ] Error retry
- [ ] Auto-refresh
- [ ] SSR?
- [ ] Revalidation on focus?
