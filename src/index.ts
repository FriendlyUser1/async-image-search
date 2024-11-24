"use strict";
import axios from "axios";
import { load } from "cheerio";
import { stringify } from "node:querystring";

const baseURL = "http://images.google.com/search?";
const exts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"];
const srcRegex = /\["(http[^"\[\]]+?)",(\d+),(\d+)\]/g;

type SearchOptions = {
	userAgent: string;
	filteredDomains: string[];
	queryString: string;
};

type Image = {
	url: string;
	width: number;
	height: number;
};

const defaultOptions: SearchOptions = {
	filteredDomains: ["gstatic.com"],
	userAgent:
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/117.0",
	queryString: "",
};

export function search(
	searchTerm: string,
	options?: SearchOptions
): Promise<Image[]> {
	const opts = Object.assign(defaultOptions, options ?? {});

	let url =
		baseURL +
		stringify({
			tbm: "isch",
			q: searchTerm,
		});

	opts.filteredDomains = defaultOptions.filteredDomains.concat(
		options?.filteredDomains ?? []
	);

	if (!Array.isArray(opts.filteredDomains))
		throw new TypeError("filteredDomains must be of type string[]");

	url += encodeURIComponent(
		opts.filteredDomains.map((s) => ` -site:${s}`).join("")
	);

	if (opts.queryString.length > 0) url += opts.queryString;

	return new Promise((resolve, reject) => {
		axios({ url: url, headers: { "User-Agent": opts.userAgent } })
			.then((res) => {
				const $ = load(res.data);
				const $scripts = $("script");

				let scriptContents: string[] = [];

				const isTagElement = (element: any): element is cheerio.TagElement =>
					element?.children !== null;

				for (let i = 0; i < $scripts.length; ++i) {
					const $script = $scripts[i];

					if (isTagElement($script) && $script.children.length > 0) {
						const content = $script.children[0]?.data;
						if (content && srcRegex.test(content)) scriptContents.push(content);
					}
				}

				function getSources(content: string) {
					let srcs: Image[] = [];

					for (const result of content.matchAll(srcRegex)) {
						if (result[1] && result[2] && result[3]) {
							let src = {
								url: decodeURI(result[1]),
								width: parseInt(result[3]),
								height: parseInt(result[2]),
							};

							if (
								opts.filteredDomains.every(
									(domain) => !src.url.includes(domain)
								) &&
								exts.some((ext) => src.url.includes(ext))
							)
								srcs.push(src);
						}
					}

					return srcs;
				}

				resolve(scriptContents.map(getSources).flat());
			})
			.catch((err) => {
				reject(err);
			});
	});
}
