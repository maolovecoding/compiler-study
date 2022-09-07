/*
 * @Author: 毛毛
 * @Date: 2022-06-26 10:36:44
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-09-06 08:17:33
 */
import {
  Program,
  Additive,
  Multiplicative,
  Numeric,
  Minus,
  Divide,
} from "./nodeTypes.js";
/**
 * 根据ast节点计算结果
 * @param {*} node
 */
export default function evaluate(node) {
  let res;
  switch (node.type) {
    case Program: // 根节点其实只有一个
      for (const child of node.children) {
        res = evaluate(child);
      }
      break;
    case Additive: // 加法节点
      res = evaluate(node.children[0]) + evaluate(node.children[1]);
      break;
    case Multiplicative:
      res = evaluate(node.children[0]) * evaluate(node.children[1]);
      break;
    case Minus:
      res = evaluate(node.children[0]) - evaluate(node.children[1]);
      break;
    case Divide:
      res = evaluate(node.children[0]) / evaluate(node.children[1]);
      break;
    case Numeric:
      res = parseFloat(node.value);
      break;
  }
  return res;
}
