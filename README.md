
# async-image-search

Asynchronous Google Images search.

Returns:
```typescript 
{ width: number, height: number, url: string }[]
```
## Installation

```bash
npm install async-image-search
```


    
## Usage/Examples

```javascript
import { search as imageSearch } from "async-image-search";

async function getImage(query, index = 0) {
	const results = await imageSearch(query);

	console.log(`Found ${results.length} results for ${query}.`);

	return results[Math.min(index, results.length - 1)];
}

getImage("Rosalina").then((image) => {
	const { width, height, url } = image;
	console.log(`Image (${width} x ${height}): ${url}`);
});
```


## Contributing

Please open an [issue] for bug reports, or a [pull request] if you want to contribute.

[issue]: https://github.com/FriendlyUser1/async-image-search/issues
[pull request]: https://github.com/FriendlyUser1/async-image-search/pulls