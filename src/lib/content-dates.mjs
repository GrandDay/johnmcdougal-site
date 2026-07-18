const UTC_CALENDAR_PARTS = {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC',
};

export function isUtcCalendarDate(value) {
	return value instanceof Date &&
		!Number.isNaN(value.valueOf()) &&
		value.getUTCHours() === 0 &&
		value.getUTCMinutes() === 0 &&
		value.getUTCSeconds() === 0 &&
		value.getUTCMilliseconds() === 0;
}

export function isValidDateOrder(pubDate, updatedDate) {
	return updatedDate === undefined || updatedDate.valueOf() >= pubDate.valueOf();
}

export function formatCalendarDate(date, locale = 'en-US') {
	return date.toLocaleDateString(locale, UTC_CALENDAR_PARTS);
}

export function calendarDateValue(date) {
	return date.toISOString().slice(0, 10);
}

export function articleDateProperties(pubDate, updatedDate) {
	return {
		datePublished: pubDate.toISOString(),
		...(updatedDate ? { dateModified: updatedDate.toISOString() } : {}),
	};
}

export function rawMarkdownDateLines(pubDate, updatedDate) {
	return [
		`date: ${calendarDateValue(pubDate)}`,
		...(updatedDate ? [`updated: ${calendarDateValue(updatedDate)}`] : []),
	];
}

export function getLatestRelatedActivity(project, posts) {
	const projectDate = project.data.updatedDate ?? project.data.pubDate;
	let latest;

	for (const post of posts) {
		if (post.data.projectRef !== project.id) continue;

		const date = post.data.updatedDate ?? post.data.pubDate;
		if (date.valueOf() <= projectDate.valueOf()) continue;
		if (!latest || date.valueOf() > latest.date.valueOf()) {
			latest = { post, date };
		}
	}

	return latest;
}
