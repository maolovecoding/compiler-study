import parse from "./parse.js";
import evaluate from "./evaluate.js";
const sourceCode = "3-1-1-2+7";
const ast = parse(sourceCode);

console.log(JSON.stringify(ast, null, 2));
const res = evaluate(ast); // 计算结果 30
console.log(res);
