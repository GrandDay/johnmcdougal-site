// Accepts a blog post or any entry-like object; a string or list in `projectRef` yields one array.
export function getProjectRefs(entry) {
	const value = entry?.data?.projectRef;
	if (value === undefined || value === null || value === '') return [];
	const refs = Array.isArray(value) ? value : [value];
	return [...new Set(refs.filter((ref) => typeof ref === 'string' && ref !== ''))];
}

export function assertProjectRefsExist(entry, projectIds) {
	for (const ref of getProjectRefs(entry)) {
		if (!projectIds.has(ref)) {
			throw new Error(`Blog entry "${entry.id}" references missing public project "${ref}".`);
		}
	}
}
