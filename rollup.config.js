import dts from "rollup-plugin-dts";
import pkg from "./package.json";

export default {
    input: "ts-build/lib/index.d.ts",
    output: {
        file: pkg.types,
        format: "es",
    },
    plugins: [dts()],
};
