"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@arcjet+runtime@1.10.0";
exports.ids = ["vendor-chunks/@arcjet+runtime@1.10.0"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/@arcjet+runtime@1.10.0/node_modules/@arcjet/runtime/dist/index.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/.pnpm/@arcjet+runtime@1.10.0/node_modules/@arcjet/runtime/dist/index.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n//#region src/index.ts\n/**\n* Detect the current runtime environment at runtime.\n*\n* @returns\n*   Runtime; empty string if not found.\n*/\nfunction runtime() {\n\tif (typeof navigator !== \"undefined\" && navigator.userAgent === \"Cloudflare-Workers\") return \"workerd\";\n\tif (typeof Deno !== \"undefined\") return \"deno\";\n\tif (typeof Bun !== \"undefined\") return \"bun\";\n\tif (typeof EdgeRuntime !== \"undefined\") return \"edge-light\";\n\tif (typeof process !== \"undefined\" && process?.release?.name === \"node\") return \"node\";\n\treturn \"\";\n}\n//#endregion\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vQGFyY2pldCtydW50aW1lQDEuMTAuMC9ub2RlX21vZHVsZXMvQGFyY2pldC9ydW50aW1lL2Rpc3QvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDbUIiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRGVzaWduXFxEZXNrdG9wXFxtYWtzZWRcXGxsbS1hcmVuYVxcbm9kZV9tb2R1bGVzXFwucG5wbVxcQGFyY2pldCtydW50aW1lQDEuMTAuMFxcbm9kZV9tb2R1bGVzXFxAYXJjamV0XFxydW50aW1lXFxkaXN0XFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyNyZWdpb24gc3JjL2luZGV4LnRzXG4vKipcbiogRGV0ZWN0IHRoZSBjdXJyZW50IHJ1bnRpbWUgZW52aXJvbm1lbnQgYXQgcnVudGltZS5cbipcbiogQHJldHVybnNcbiogICBSdW50aW1lOyBlbXB0eSBzdHJpbmcgaWYgbm90IGZvdW5kLlxuKi9cbmZ1bmN0aW9uIHJ1bnRpbWUoKSB7XG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvci51c2VyQWdlbnQgPT09IFwiQ2xvdWRmbGFyZS1Xb3JrZXJzXCIpIHJldHVybiBcIndvcmtlcmRcIjtcblx0aWYgKHR5cGVvZiBEZW5vICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gXCJkZW5vXCI7XG5cdGlmICh0eXBlb2YgQnVuICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gXCJidW5cIjtcblx0aWYgKHR5cGVvZiBFZGdlUnVudGltZSAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIFwiZWRnZS1saWdodFwiO1xuXHRpZiAodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2Vzcz8ucmVsZWFzZT8ubmFtZSA9PT0gXCJub2RlXCIpIHJldHVybiBcIm5vZGVcIjtcblx0cmV0dXJuIFwiXCI7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IHJ1bnRpbWUgfTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/@arcjet+runtime@1.10.0/node_modules/@arcjet/runtime/dist/index.js\n");

/***/ })

};
;