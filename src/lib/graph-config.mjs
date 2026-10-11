// Force parameters for the content graph. Layout multipliers default to 1 and scale pull and spacing per group.
export const EDGE_FORCES = {
	tag: { group: 'tag', distance: 82, strength: 0.32 },
	projectRef: { group: 'project', distance: 130, strength: 0.8 },
	series: { group: 'series', distance: 55, strength: 0.9 },
	seriesProject: { group: 'project', distance: 150, strength: 0.4 },
};

export const NODE_CHARGE = {
	tag: -75,
	post: -230,
	series: -260,
	project: -300,
};

export const LAYOUT_CONTROLS = {
	series: { label: 'Series pull', min: 0.25, max: 2, step: 0.05, default: 1 },
	project: { label: 'Project pull', min: 0.25, max: 2, step: 0.05, default: 1 },
	tag: { label: 'Tag pull', min: 0.25, max: 2, step: 0.05, default: 1 },
	spacing: { label: 'Spacing', min: 0.5, max: 2, step: 0.05, default: 1 },
};

export const DEFAULT_LAYOUT = Object.fromEntries(
	Object.entries(LAYOUT_CONTROLS).map(([key, control]) => [key, control.default]),
);

const MIN_LINK_DISTANCE = 20;

export function sanitizeLayout(input) {
	const source = input !== null && typeof input === 'object' ? input : {};
	const layout = {};
	for (const [key, control] of Object.entries(LAYOUT_CONTROLS)) {
		const value = source[key];
		layout[key] = typeof value === 'number' && Number.isFinite(value)
			? Math.min(control.max, Math.max(control.min, value))
			: control.default;
	}
	return layout;
}

export function resolveForces(rawLayout = DEFAULT_LAYOUT) {
	const layout = sanitizeLayout(rawLayout);
	const edgeForce = (type) => EDGE_FORCES[type] ?? EDGE_FORCES.tag;
	return {
		linkDistance(type) {
			const { group, distance } = edgeForce(type);
			return Math.max(MIN_LINK_DISTANCE, distance / layout[group]);
		},
		linkStrength(type) {
			const { group, strength } = edgeForce(type);
			return Math.min(1, strength * layout[group]);
		},
		charge(nodeType) {
			return (NODE_CHARGE[nodeType] ?? NODE_CHARGE.post) * layout.spacing;
		},
	};
}

export const LAYOUT_STORAGE_KEY = 'graph-layout-v1';

export function loadLayout(storage) {
	try {
		const raw = storage?.getItem(LAYOUT_STORAGE_KEY);
		return sanitizeLayout(raw ? JSON.parse(raw) : undefined);
	} catch {
		return sanitizeLayout(undefined);
	}
}

export function saveLayout(storage, layout) {
	try {
		const clean = sanitizeLayout(layout);
		const isDefault = Object.keys(DEFAULT_LAYOUT).every((key) => clean[key] === DEFAULT_LAYOUT[key]);
		if (isDefault) storage?.removeItem(LAYOUT_STORAGE_KEY);
		else storage?.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(clean));
	} catch {
		// Storage can be unavailable (private mode, blocked); the layout just won't persist.
	}
}
