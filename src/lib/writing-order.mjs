/** Sort newest dates first, grouping same-day series posts in reverse part order. */
export function compareWritingPosts(a, b) {
	const dateOrder = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
	if (dateOrder) return dateOrder;
	const aGroup = a.data.series ?? a.id;
	const bGroup = b.data.series ?? b.id;
	return aGroup.localeCompare(bGroup)
		|| (b.data.seriesPart ?? 0) - (a.data.seriesPart ?? 0)
		|| a.id.localeCompare(b.id);
}
