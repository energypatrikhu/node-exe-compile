export interface Pkg {
	targets: Array<string>;
	scripts: Array<string>;
	assets: Array<string>;
	outputPath: string;
	additional: {
		[key: string]: string | Array<string>;
	};
}

export interface PkgConfig {
	name: string;
	main: string;
	bin: string;
	pkg: Pkg;
}
