import * as nodeTypes from "./nodeTypes.js";

export const codeGenerator = (node) => {
  switch (node.type) {
    case nodeTypes.Program:
      return node.body.map(codeGenerator).join("\n");
    case nodeTypes.ExpressionStatement:
      return codeGenerator(node.expression);
    case nodeTypes.CallExpression:
      return (
        codeGenerator(node.callee) +
        `(${node.arguments.map(codeGenerator).join(", ")})`
      );
    case nodeTypes.MemberExpression:
      return codeGenerator(node.object) + "." + codeGenerator(node.property);
    case nodeTypes.ObjectExpression:
      return `{${node.properties.map(codeGenerator).join(", ")}}`;
    case nodeTypes.Property:
      return `${codeGenerator(node.key)}: ${codeGenerator(node.value)}`;
    case nodeTypes.Identifier:
      return node.name;
    case nodeTypes.StringLiteral:
      return `'${node.value}'`;
    case nodeTypes.NullLiteral:
      return 'null';
  }
};
