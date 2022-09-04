/*
 * @Author: 毛毛
 * @Date: 2022-06-26 09:00:24
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 10:24:44
 */
import { TokenReader } from "./tokenizer.js";
import { NUMBER, PLUS, MULTIPLE } from "./tokenTypes.js";
import { Program, Numeric, Additive, Multiplicative } from "./nodeTypes.js";
import ASTNode from "./astNode.js";
/**
 * token转ast
 * @param {TokenReader} tokenReader
 */
export default function toAST(tokenReader) {
  const rootNode = new ASTNode(Program);
  // 开始推导 加法 乘法 先推导成加法
  // 实现的时候 每个规则都是一个函数 additive就是加法规则的函数
  const child = additive(tokenReader);
  if (child) {
    rootNode.appendChild(child);
  }
  return rootNode;
}
/**
 * 加法
 * @param {TokenReader} tokenReader
 */
function additive(tokenReader) {
  const child1 = multiple(tokenReader);
  let node = child1;
  // 拿到下一个token 看是不是 +
  let nextToken = tokenReader.peek();
  if (child1 != null && nextToken != null) {
    if (nextToken.type === PLUS) {
      // 匹配到 + 取出该token消耗掉
      nextToken = tokenReader.read();
      const child2 = additive(tokenReader); // 递归下降
      if (child2 != null) {
        node = new ASTNode(Additive);
        node.appendChild(child1);
        node.appendChild(child2);
      }
    }
  }
  return node;
}
/**
 * 乘法
 * @param {TokenReader} tokenReader
 */
function multiple(tokenReader) {
  // 匹配出来了 number了 但是乘法匹配规则还没有匹配结束
  const child1 = number(tokenReader);
  let node = child1;
  // 、看下一个token 是什么
  let nextToken = tokenReader.peek(); // +
  if (child1 != null && nextToken != null) {
    if (nextToken.type === MULTIPLE) {
      // 后面是乘法 *
      nextToken = tokenReader.read();
      const child2 = multiple(tokenReader);
      if (child2 != null) {
        // 乘法 AST节点
        node = new ASTNode(Multiplicative);
        node.appendChild(child1);
        node.appendChild(child2);
      }
    }
  }
  return node;
}
/**
 * 数字
 * @param {TokenReader} tokenReader
 */
function number(tokenReader) {
  let node = null;
  let token = tokenReader.peek(); // 查看当前token
  if (token != null && token.type === NUMBER) {
    // 匹配到数字 消耗掉当前的token了
    token = tokenReader.read();
    // 创建一个新的语法树节点 类型是 Numeric 值就是token的值
    node = new ASTNode(Numeric, token.value);
  }
  return node;
}
