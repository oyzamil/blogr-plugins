[**blogr-plugins**](../README.md)

***

[blogr-plugins](../README.md) / ReadMeterOptions

# Interface: ReadMeterOptions

Defined in: src/plugins/readMeter.ts:9

Configuration options for [readMeter](../functions/readMeter.md).

## Properties

### appendTo?

> `optional` **appendTo?**: `string` \| `HTMLElement` \| `null`

Defined in: src/plugins/readMeter.ts:78

Selector or element where to insert read time. The badge is
*appended* into it (existing content is left alone) and reused on
recalculation rather than duplicated.
If null, no auto-insert – just return value via onUpdate.

#### Default

```ts
null
```

***

### codeWordsPerMinute?

> `optional` **codeWordsPerMinute?**: `number`

Defined in: src/plugins/readMeter.ts:54

Words per minute for code when includeCode true.

#### Default

```ts
100
```

***

### debounceMs?

> `optional` **debounceMs?**: `number`

Defined in: src/plugins/readMeter.ts:88

Debounce delay in ms for resize handler.

#### Default

```ts
250
```

***

### excludeElements?

> `optional` **excludeElements?**: `string`[]

Defined in: src/plugins/readMeter.ts:27

CSS selectors, relative to each matched target, for descendants to
strip out of the calculation — e.g. `[".share-buttons", ".ad"]`.
Applied after [includeElements](#includeelements), so it can exclude a nested
element within whatever was included.

#### Default

```ts
undefined (nothing excluded)
```

***

### format?

> `optional` **format?**: [`ReadMeterFormat`](../type-aliases/ReadMeterFormat.md)

Defined in: src/plugins/readMeter.ts:62

Output format.
- "minutes" – e.g., "5"
- "minutes+seconds" – e.g., "5m 30s"
- "text" – e.g., "5 minute read"

#### Default

```ts
"minutes"
```

***

### imageTimeSeconds?

> `optional` **imageTimeSeconds?**: `number`

Defined in: src/plugins/readMeter.ts:42

Seconds per image when includeImages true.

#### Default

```ts
10
```

***

### includeCode?

> `optional` **includeCode?**: `boolean`

Defined in: src/plugins/readMeter.ts:49

Count code blocks (`<pre>`, `<code>`) separately, at
[codeWordsPerMinute](#codewordsperminute) instead of [wordsPerMinute](#wordsperminute), rather
than folding their text into the regular word count.

#### Default

```ts
false
```

***

### includeElements?

> `optional` **includeElements?**: `string`[]

Defined in: src/plugins/readMeter.ts:19

CSS selectors, relative to each matched target, for the child
elements to include in the read-time calculation — e.g.
`["article", ".excerpt"]`. Every matching descendant across all
given selectors is included (deduplicated). If omitted, or if none
of the selectors match anything inside the target, the whole
target is used instead.

#### Default

```ts
undefined (whole target)
```

***

### includeImages?

> `optional` **includeImages?**: `boolean`

Defined in: src/plugins/readMeter.ts:37

Add extra time for images.

#### Default

```ts
false
```

***

### onUpdate?

> `optional` **onUpdate?**: (`timeString`, `minutes`) => `void`

Defined in: src/plugins/readMeter.ts:93

Callback after each calculation.
Receives formatted time string and raw (unrounded) minutes.

#### Parameters

##### timeString

`string`

##### minutes

`number`

#### Returns

`void`

***

### template?

> `optional` **template?**: (`readTime`) => `string`

Defined in: src/plugins/readMeter.ts:70

Renders the badge's markup. Receives the formatted time string,
returns the HTML to use as the badge's `innerHTML` verbatim —
matches the `template` convention used by [createWidget](../functions/createWidget.md) and
[relatify](../functions/relatify.md).

#### Parameters

##### readTime

`string`

#### Returns

`string`

#### Default

(time) => `Read time: ${time}`

***

### updateOnResize?

> `optional` **updateOnResize?**: `boolean`

Defined in: src/plugins/readMeter.ts:83

Recalculate on window resize (e.g., after layout shift).

#### Default

```ts
false
```

***

### wordsPerMinute?

> `optional` **wordsPerMinute?**: `number`

Defined in: src/plugins/readMeter.ts:32

Reading speed in words per minute.

#### Default

```ts
200
```
