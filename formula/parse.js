/*
 * @Author: 毛毛
 * @Date: 2022-06-26 08:23:43
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 10:31:32
 */
import tokenize from "./tokenizer.js";
import toAST from "./toAST.js";
// parse 是一个函数 可以把一段代码转为抽象语法树
export default function parse(script) {
  // 1. 把代码进行分词处理
  const tokenReader = tokenize(script);
  // token -> ast
  const ast = toAST(tokenReader);
  return ast;
}
