const mermaidFence = /^[ \t]{0,3}(?:`{3,}|~{3,})[ \t]*mermaid(?:[ \t]+[^\r\n]*)?[ \t]*$/im;

export function hasMermaidFence(markdown: string | undefined): boolean {
	return markdown ? mermaidFence.test(markdown) : false;
}