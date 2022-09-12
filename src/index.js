import { codeGenerator } from "./codeGenerator.js";
import { parser } from "./parser.js";
import { transformer } from "./transformer.js";




const sourceCode = `<div id="title" name={name}><span>hello</span>world</div>`;

const ast = parser(sourceCode);
transformer(ast);
const code = codeGenerator(ast)
console.log(code);