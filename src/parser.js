import tokenizer from "./tokenizer.js";
import * as tokenTypes from "./tokenTypes.js";
import * as nodeTypes from "./nodeTypes.js";

const parser = (sourceCode) => {
  const tokens = tokenizer(sourceCode);
  // console.log(tokens)
  let pos = 0; // 当前所在的token索引
  const walk = (parent) => {
    let token = tokens[pos];
    // 下一个token
    let nextToken = tokens[pos + 1];
    // JSX Element
    if (
      token.type === tokenTypes.LeftParentheses &&
      nextToken.type === tokenTypes.JSXIdentifier
    ) {
      // < + tag
      let node = {
        type: nodeTypes.JSXElement,
        openingElement: null,
        closingElement: null,
        children: [],
      };
      // 1. 给开始标签赋值
      token = tokens[++pos];
      node.openingElement = {
        type: nodeTypes.JSXOpeningElement,
        name: {
          type: nodeTypes.JSXIdentifier,
          name: token.value, //div
        },
        attributes: [],
      };
      // 循环给属性数组赋值
      token = tokens[++pos]; // 当前标签标识可以跳过了
      while (token.type === tokenTypes.AttributeKey) {
        node.openingElement.attributes.push(walk());
        token = tokens[pos];
      }
      token = tokens[++pos];
      nextToken = tokens[pos + 1];
      while (
        // 文本类型子节点
        token.type !== tokenTypes.LeftParentheses ||
        // 元素类型子节点
        (token.type === tokenTypes.LeftParentheses &&
          nextToken.type !== tokenTypes.BackSlash)
      ) {
        node.children.push(walk());
        token = tokens[pos];
        nextToken = tokens[pos + 1];
      }
      node.closingElement = walk(node);
      return node;
    }
    // 属性
    else if (token.type === tokenTypes.AttributeKey) {
      pos += 2;
      let nextToken = tokens[pos]; // value
      let node = {
        type: nodeTypes.JSXAttribute,
        name: {
          type: nodeTypes.JSXIdentifier,
          name: token.value, //id
        },
        value: {
          type: nodeTypes.Literal,
          value: nextToken.value, // title
        },
      };
      pos++;
      return node;
    }
    // 文本
    else if (token.type === tokenTypes.JSXText) {
      pos++;
      return {
        type: nodeTypes.JSXText,
        value: token.value,
      };
    }
    // 有父节点 处理结束标签
    if (
      parent &&
      token.type === tokenTypes.LeftParentheses && // <
      nextToken.type === tokenTypes.BackSlash // /
    ) {
      pos++;
      pos++; // 跳过 < /
      token = tokens[pos];
      pos++; // span
      pos++; // 跳过标签 >
      if (parent.openingElement.name.name !== token.value) {
        throw new TypeError("开始标签 和结束标签 不匹配");
      }
      return {
        type: nodeTypes.JSXClosingElement,
        name: {
          type: nodeTypes.JSXIdentifier,
          name: token.value,
        },
      };
    }
    throw new Error("非法");
  };
  let ast = {
    type: nodeTypes.Program,

    body: [
      {
        type: nodeTypes.ExpressionStatement,
        expression: walk(),
      },
    ],
  };
  return ast;
};

// const sourceCode = `<div id="title" name={name}><span>hello</span>world</div>`;

// console.log(JSON.stringify(parser(sourceCode), null, 2));

export { parser };

/**    
[
  { type: 'LeftParentheses', value: '<' },
  { type: 'JSXIdentifier', value: 'div' },
  { type: 'AttributeKey', value: 'id' },
  { type: 'Equator', value: '=' },
  { type: 'AttributeStringValue', value: '"title"' },
  { type: 'AttributeKey', value: 'name' },
  { type: 'Equator', value: '=' },
  { type: 'AttributeStringValue', value: '{name}' },
  { type: 'RightParentheses', value: '>' },
  { type: 'LeftParentheses', value: '<' },
  { type: 'JSXIdentifier', value: 'span' },
  { type: 'RightParentheses', value: '>' },
  { type: 'JSXText', value: 'hello' },
  { type: 'LeftParentheses', value: '<' },
  { type: 'BackSlash', value: '/' },
  { type: 'JSXIdentifier', value: 'span' },
  { type: 'RightParentheses', value: '>' },
  { type: 'JSXText', value: 'world' },
  { type: 'LeftParentheses', value: '<' },
  { type: 'BackSlash', value: '/' },
  { type: 'JSXIdentifier', value: 'div' },
  { type: 'RightParentheses', value: '>' }
]



 */
const aaa = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "JSXElement",
        openingElement: {
          type: "JSXOpeningElement",
          name: {
            type: "JSXIdentifier",
            name: "div",
          },
          attributes: [
            {
              type: "JSXAttribute",
              name: {
                type: "JSXIdentifier",
                name: "id",
              },
              value: {
                type: "Literal",
                value: '"title"',
              },
            },
            {
              type: "JSXAttribute",
              name: {
                type: "JSXIdentifier",
                name: "name",
              },
              value: {
                type: "Literal",
                value: "{name}",
              },
            },
          ],
        },
        closingElement: {
          type: "JSXIdentifier",
          name: {
            type: "JSXIdentifier",
            name: "div",
          },
        },
        children: [
          {
            type: "JSXElement",
            openingElement: {
              type: "JSXOpeningElement",
              name: {
                type: "JSXIdentifier",
                name: "span",
              },
              attributes: [],
            },
            closingElement: {
              type: "JSXIdentifier",
              name: {
                type: "JSXIdentifier",
                name: "span",
              },
            },
            children: [
              {
                type: "JSXText",
                value: "hello",
              },
            ],
          },
          {
            type: "JSXText",
            value: "world",
          },
        ],
      },
    },
  ],
};
