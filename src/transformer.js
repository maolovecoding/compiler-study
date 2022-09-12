import { parser } from "./parser.js";
import { traverse } from "./traverse.js";
import * as nodeTypes from "./nodeTypes.js";

class Types {
  // 生成AST节点
  static nullLiteral() {
    return { type: nodeTypes.NullLiteral };
  }
  // 字符串字面量
  static stringLiteral(value) {
    return { type: nodeTypes.StringLiteral, value };
  }
  // 成员表达式
  static memberExpression(object, property) {
    return {
      type: nodeTypes.MemberExpression,
      object,
      property,
    };
  }
  // 标识符
  static identifier(name) {
    return { type: nodeTypes.Identifier, name };
  }
  static objectExpression(properties) {
    return {
      type: nodeTypes.ObjectExpression,
      properties,
    };
  }
  static property(key, value) {
    return {
      type: nodeTypes.Property,
      key,
      value,
    };
  }
  static callExpression(callee, _arguments) {
    return {
      type: nodeTypes.CallExpression,
      callee,
      arguments: _arguments,
    };
  }
  // 判断节点类型
  static isJSXElement(node) {
    return node.type === nodeTypes.JSXElement;
  }
  static isJSXText(node) {
    return node.type === nodeTypes.JSXText;
  }
}

export const transformer = (ast) => {
  traverse(ast, {
    // 对象 拦截进入和离开
    JSXElement(nodePath, parent) {
      // nodePath 节点路径
      // 传入一个JSXElement语法树节点 返回一个方法调用的新节点
      const transform = (node) => {
        if (!node) return Types.nullLiteral(); //null
        // 要转换的节点是 jsx元素
        if (Types.isJSXElement(node)) {
          // 转为方法调用
          const memberExpression = Types.memberExpression(
            Types.identifier("React"),
            Types.identifier("createElement")
          );
          // const _arguments = [];
          const elementType = Types.stringLiteral(
            node.openingElement.name.name
          );
          const attributes = node.openingElement.attributes;
          const objectExpression =
            attributes.length > 0
              ? Types.objectExpression(
                  attributes.map((attr) => {
                    return Types.property(
                      Types.identifier(attr.name.name),
                      Types.stringLiteral(attr.value.value)
                    );
                  })
                )
              : Types.nullLiteral;
          const _arguments = [
            elementType,
            objectExpression,
            ...node.children.map((child) => transform(child)),
          ];
          return Types.callExpression(memberExpression, _arguments);
        } else if (Types.isJSXText(node)) {
          // jsx文本
          return Types.stringLiteral(node.value);
        }
      };
      const newNode = transform(nodePath.node);
      // 用心节点替换老节点
      nodePath.replaceWith(newNode);
    },
  });
};
// const sourceCode = `<div id="title" name={name}><span>hello</span>world</div>`;

// const ast = parser(sourceCode);
// transformer(ast);
// console.log(JSON.stringify(ast, null, 2));
/**
{
  "type": "Program",
  "body": [
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "object": {
            "type": "Identifier",
            "name": "React"
          },
          "property": {
            "type": "Identifier",
            "name": "createElement"
          }
        },
        "arguments": [
          {
            "type": "StringLiteral",
            "value": "div"
          },
          {
            "type": "ObjectExpression",
            "properties": [
              {
                "type": "Property",
                "key": {
                  "type": "Identifier",
                  "name": "id"
                },
                "value": {
                  "type": "StringLiteral",
                  "value": "\"title\""
                }
              },
              {
                "type": "Property",
                "key": {
                  "type": "Identifier",
                  "name": "name"
                },
                "value": {
                  "type": "StringLiteral",
                  "value": "{name}"
                }
              }
            ]
          },
          {
            "type": "CallExpression",
            "callee": {
              "type": "MemberExpression",
              "object": {
                "type": "Identifier",
                "name": "React"
              },
              "property": {
                "type": "Identifier",
                "name": "createElement"
              }
            },
            "arguments": [
              {
                "type": "StringLiteral",
                "value": "span"
              },
              null,
              {
                "type": "StringLiteral",
                "value": "hello"
              }
            ]
          },
          {
            "type": "StringLiteral",
            "value": "world"
          }
        ]
      }
    }
  ]
}
*/
