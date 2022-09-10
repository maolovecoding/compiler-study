import { parser } from "./parser.js";
import * as nodeTypes from "./nodeTypes.js";
/**
 *
 * @param {*} ast
 * @param {*} visitor 访问器模式 深度优先
 */
const traverse = (ast, visitor) => {
  const traverseArray = (array, parent) => {
    array.forEach((child) => traverseNode(child, parent));
  };
  const traverseNode = (node, parent) => {
    // 遍历 转换 都是模拟babel
    const method = visitor[node.type];
    if (method) {
      if (typeof method === "function") {
        method({ node }, parent);
      } else {
        method?.enter({ node }, parent);
      }
    }
    switch (node.type) {
      case nodeTypes.Program:
        traverseArray(node.body);
        break;
      case nodeTypes.ExpressionStatement:
        traverseNode(node.expression, node);
        break;
      case nodeTypes.JSXElement:
        traverseNode(node.openingElement, node);
        traverseArray(node.children, node);
        traverseNode(node.closingElement, node);
        break;
      case nodeTypes.JSXOpeningElement:
        traverseNode(node.name, node);
        traverseArray(node.attributes, node);
        break;
      case nodeTypes.JSXAttribute:
        traverseNode(node.name, node);
        traverseNode(node.value, node);
        break;
      case nodeTypes.JSXClosingElement:
        traverseNode(node.name, node);
        break;
      // 没有子节点
      case nodeTypes.JSXIdentifier:
      case nodeTypes.JSXText:
      case nodeTypes.Literal:
        break;
      default:
        break;
    }
    // 离开节点
    method?.exit?.({ node }, parent);
  };
  traverseNode(ast, null); // 遍历AST
};

const sourceCode = `<div id="title" name={name}><span>hello</span>world</div>`;

const ast = parser(sourceCode);

traverse(ast, {
  // 对象 拦截进入和离开
  JSXOpeningElement: {
    enter(nodePath, parent) {
      console.log("进入开始元素", nodePath.node);
    },
    exit(nodePath, parent) {
      console.log("离开开始元素", nodePath.node);
    },
  },
  // 函数 只拦截进入
  JSXClosingElement(nodePath, parent) {
    console.log("进入结束元素", nodePath.node);
  },
});
