import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareWritingPosts } from './writing-order.mjs';

test('orders dates newest first and same-day series parts newest first', () => {
	const post = (id, date, series, seriesPart) => ({ id, data: { pubDate: new Date(date), series, seriesPart } });
	const posts = [
		post('part-2', '2026-11-14', 'series', 2),
		post('older', '2026-11-13'),
		post('part-5', '2026-11-14', 'series', 5),
		post('standalone', '2026-11-14'),
		post('part-3', '2026-11-14', 'series', 3),
	];
	assert.deepEqual(posts.sort(compareWritingPosts).map(({ id }) => id), [
		'part-5', 'part-3', 'part-2', 'standalone', 'older',
	]);
});
